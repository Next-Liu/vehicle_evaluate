"""
车流量预测ML服务 - Flask主入口
"""
import os
# 禁用PyTorch oneDNN优化，解决CPU架构兼容性问题
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import logging
from flask import Flask, request, jsonify
from functools import wraps

from .services.traffic_predictor import TrafficFlowPredictor
from .config import Config

# 配置日志
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建Flask应用
app = Flask(__name__)

# 初始化预测器
predictor = None


def init_predictor():
    """初始化预测器"""
    global predictor
    try:
        predictor = TrafficFlowPredictor(Config.MODEL_DIR)
        logger.info("预测器初始化成功")
    except Exception as e:
        logger.error(f"预测器初始化失败: {str(e)}")
        raise


def handle_errors(f):
    """错误处理装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"请求处理失败: {str(e)}", exc_info=True)
            return jsonify({
                'code': 500,
                'message': str(e),
                'data': None
            }), 500
    return decorated_function


@app.route('/health', methods=['GET'])
def health_check():
    """
    健康检查接口

    Returns:
        服务状态信息
    """
    return jsonify({
        'code': 200,
        'message': 'healthy',
        'data': {
            'service': 'traffic-flow-predictor',
            'model': 'mlp-transformer-150',
            'device': str(predictor.device) if predictor else 'not initialized'
        }
    })


@app.route('/predict', methods=['POST'])
@handle_errors
def predict():
    """
    单条预测接口

    Request Body:
        {
            "KIND": "高速路",
            "WIDTH": 24.5,
            "DIRECTION": 1,
            "FUNCCLASS": 1,
            "LENGTH": 1500.0,
            "SPEEDCLASS": 3,
            "month": 3,
            "day_of_week": 5,
            "hour": 8
        }

    Returns:
        {
            "code": 200,
            "message": "success",
            "data": {"quantity": 1250.5}
        }
    """
    data = request.get_json()
    if not data:
        return jsonify({
            'code': 400,
            'message': '请求体不能为空',
            'data': None
        }), 400

    result = predictor.predict(data)

    return jsonify({
        'code': 200,
        'message': 'success',
        'data': {'quantity': round(result, 2)}
    })


@app.route('/batch', methods=['POST'])
@handle_errors
def batch_predict():
    """
    批量预测接口

    Request Body:
        {
            "data": [
                {"KIND": "高速路", "WIDTH": 24.5, ...},
                {"KIND": "主干道", "WIDTH": 18.0, ...}
            ]
        }

    Returns:
        {
            "code": 200,
            "message": "success",
            "data": {"quantities": [1250.5, 890.3]}
        }
    """
    json_data = request.get_json()
    if not json_data:
        return jsonify({
            'code': 400,
            'message': '请求体不能为空',
            'data': None
        }), 400

    features_list = json_data.get('data', [])
    if not features_list:
        return jsonify({
            'code': 400,
            'message': 'data字段不能为空',
            'data': None
        }), 400

    results = predictor.batch_predict(features_list)

    return jsonify({
        'code': 200,
        'message': 'success',
        'data': {'quantities': [round(r, 2) for r in results]}
    })


@app.route('/features', methods=['GET'])
def get_features():
    """
    获取模型所需特征列表

    Returns:
        特征列表及说明
    """
    return jsonify({
        'code': 200,
        'message': 'success',
        'data': {
            'features': [
                {'name': 'KIND', 'type': 'string', 'description': '道路类型'},
                {'name': 'WIDTH', 'type': 'float', 'description': '道路宽度'},
                {'name': 'DIRECTION', 'type': 'int', 'description': '方向'},
                {'name': 'FUNCCLASS', 'type': 'int', 'description': '功能等级'},
                {'name': 'LENGTH', 'type': 'float', 'description': '道路长度'},
                {'name': 'SPEEDCLASS', 'type': 'int', 'description': '速度等级'},
                {'name': 'month', 'type': 'int', 'description': '月份 (1-12)'},
                {'name': 'day_of_week', 'type': 'int', 'description': '星期 (0-6)'},
                {'name': 'hour', 'type': 'int', 'description': '小时 (0-23)'}
            ]
        }
    })


# 应用启动时初始化
with app.app_context():
    init_predictor()


if __name__ == '__main__':
    app.run(host=Config.HOST, port=Config.PORT, debug=False)