"""
ML服务配置
"""
import os


class Config:
    """服务配置类"""

    # 模型目录
    MODEL_DIR = os.environ.get(
        'MODEL_DIR',
        '/app/models/traffic_flow/mlp-transformer-150'
    )

    # 服务配置
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 5000))

    # 日志级别
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')