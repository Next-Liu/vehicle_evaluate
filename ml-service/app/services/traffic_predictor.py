"""
车流量预测服务
"""
import torch
import numpy as np
from pathlib import Path
from joblib import load
from typing import List, Dict, Union
import logging

from ..models.hybrid_model import HybridModel

logger = logging.getLogger(__name__)


class TrafficFlowPredictor:
    """车流量预测服务"""

    # 输入特征列表
    FEATURE_COLS = ['KIND_encoded', 'WIDTH', 'DIRECTION', 'FUNCCLASS',
                    'LENGTH', 'SPEEDCLASS', 'month', 'day_of_week', 'hour']

    def __init__(self, model_dir: str):
        """
        初始化预测器

        Args:
            model_dir: 模型文件目录路径
        """
        self.model_dir = Path(model_dir)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"使用设备: {self.device}")

        self._load_model()
        self._load_preprocessors()
        logger.info("模型和预处理组件加载完成")

    def _load_model(self):
        """加载PyTorch模型"""
        model_path = self.model_dir / 'best_hybrid_model.pth'
        if not model_path.exists():
            raise FileNotFoundError(f"模型文件不存在: {model_path}")

        self.model = HybridModel(input_size=9)
        state_dict = torch.load(model_path, map_location=self.device, weights_only=True)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()
        logger.info(f"模型加载成功: {model_path}")

    def _load_preprocessors(self):
        """加载预处理组件"""
        scaler_path = self.model_dir / 'standard_scaler.joblib'
        encoder_path = self.model_dir / 'kind_target_encoding.joblib'

        if not scaler_path.exists():
            raise FileNotFoundError(f"Scaler文件不存在: {scaler_path}")
        if not encoder_path.exists():
            raise FileNotFoundError(f"编码器文件不存在: {encoder_path}")

        self.scaler = load(scaler_path)
        self.kind_encoder = load(encoder_path)
        logger.info("预处理组件加载成功")

    def encode_kind(self, kind: str) -> float:
        """
        对KIND进行目标编码

        Args:
            kind: 道路类型字符串

        Returns:
            编码后的数值
        """
        # kind_encoder 是 pandas Series，索引为KIND值
        if kind in self.kind_encoder.index:
            return float(self.kind_encoder[kind])
        # 使用均值作为默认值
        return float(self.kind_encoder.mean())

    def predict(self, features: Dict[str, Union[str, int, float]]) -> float:
        """
        单条预测

        Args:
            features: 包含所有特征的字典
                - KIND: 道路类型 (字符串)
                - WIDTH: 道路宽度
                - DIRECTION: 方向
                - FUNCCLASS: 功能等级
                - LENGTH: 道路长度
                - SPEEDCLASS: 速度等级
                - month: 月份
                - day_of_week: 星期
                - hour: 小时

        Returns:
            预测的车流量值
        """
        # 构建特征向量
        feature_values = self._build_features(features)

        # 标准化
        X_scaled = self.scaler.transform([feature_values])

        # 转换为张量
        X_tensor = torch.from_numpy(X_scaled.astype('float32')).to(self.device)

        # 预测
        with torch.no_grad():
            prediction = self.model(X_tensor)

        return abs(prediction.item())

    def batch_predict(self, features_list: List[Dict[str, Union[str, int, float]]]) -> List[float]:
        """
        批量预测

        Args:
            features_list: 特征字典列表

        Returns:
            预测结果列表
        """
        if not features_list:
            return []

        # 构建特征矩阵
        X = np.array([self._build_features(f) for f in features_list])

        # 标准化
        X_scaled = self.scaler.transform(X)

        # 转换为张量
        X_tensor = torch.from_numpy(X_scaled.astype('float32')).to(self.device)

        # 批量预测
        with torch.no_grad():
            predictions = self.model(X_tensor)

        return [abs(float(p)) for p in predictions.cpu().numpy().flatten()]

    def _build_features(self, features: Dict[str, Union[str, int, float]]) -> List[float]:
        """
        构建特征向量

        Args:
            features: 原始特征字典

        Returns:
            特征向量列表
        """
        kind_encoded = self.encode_kind(str(features.get('KIND', '')))

        return [
            kind_encoded,
            float(features.get('WIDTH', 0)),
            float(features.get('DIRECTION', 0)),
            float(features.get('FUNCCLASS', 0)),
            float(features.get('LENGTH', 0)),
            float(features.get('SPEEDCLASS', 0)),
            float(features.get('month', 1)),
            float(features.get('day_of_week', 0)),
            float(features.get('hour', 0))
        ]