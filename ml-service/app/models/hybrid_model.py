"""
MLP-Transformer 混合模型定义
用于车流量预测
"""
import torch
import torch.nn as nn


class HybridModel(nn.Module):
    """
    MLP-Transformer 混合模型

    结构:
        输入层(9) -> MLP(128->64) -> Transformer(d_model=64, heads=4, layers=2) -> 回归头(64->32->1)
    """

    def __init__(self, input_size: int = 9, num_heads: int = 4, num_layers: int = 2):
        super(HybridModel, self).__init__()

        # MLP部分（特征提取）
        self.mlp = nn.Sequential(
            nn.Linear(input_size, 128),
            nn.ReLU(),
            nn.LayerNorm(128),
            nn.Linear(128, 64),
            nn.ReLU()
        )

        # Transformer部分（特征交互）
        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(
                d_model=64,
                nhead=num_heads,
                dim_feedforward=128,
                batch_first=True
            ),
            num_layers=num_layers
        )

        # 回归头
        self.regressor = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        """
        前向传播

        Args:
            x: 输入张量 (batch_size, input_size)

        Returns:
            预测值 (batch_size, 1)
        """
        # MLP特征提取
        x = self.mlp(x)
        # 添加序列维度 (batch_size, seq_len=1, features)
        x = x.unsqueeze(1)
        # Transformer处理
        x = self.transformer(x)
        # 移除序列维度
        x = x.squeeze(1)
        # 最终回归
        return self.regressor(x)