-- 创建数据库
CREATE DATABASE IF NOT EXISTS emission_assessment DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE emission_assessment;

-- 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    real_name VARCHAR(50) COMMENT '真实姓名',
    role VARCHAR(20) DEFAULT 'USER' COMMENT '角色：ADMIN-管理员, USER-普通用户',
    status INT DEFAULT 1 COMMENT '状态：0-禁用,1-启用',
    last_login_time DATETIME COMMENT '最后登录时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0 COMMENT '逻辑删除：0-未删除,1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 空气质量监测数据表
CREATE TABLE IF NOT EXISTS air_quality (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id VARCHAR(50) NOT NULL COMMENT '监测站点ID',
    station_name VARCHAR(100) COMMENT '监测站点名称',
    longitude DECIMAL(10, 6) COMMENT '经度',
    latitude DECIMAL(10, 6) COMMENT '纬度',
    monitor_time DATETIME NOT NULL COMMENT '监测时间',
    pm25 DECIMAL(10, 2) COMMENT 'PM2.5浓度(μg/m³)',
    pm10 DECIMAL(10, 2) COMMENT 'PM10浓度(μg/m³)',
    no2 DECIMAL(10, 2) COMMENT 'NO2浓度(μg/m³)',
    so2 DECIMAL(10, 2) COMMENT 'SO2浓度(μg/m³)',
    o3 DECIMAL(10, 2) COMMENT 'O3浓度(μg/m³)',
    co DECIMAL(10, 2) COMMENT 'CO浓度(mg/m³)',
    aqi INT COMMENT '空气质量指数',
    primary_pollutant VARCHAR(50) COMMENT '首要污染物',
    quality_level VARCHAR(50) COMMENT '空气质量等级',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='空气质量监测数据表';

-- 插入默认管理员账号（用户名：admin，密码：admin123）
-- BCrypt加密后的密码
INSERT INTO sys_user (username, password, email, real_name, role)
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin@example.com', '系统管理员', 'ADMIN')
ON DUPLICATE KEY UPDATE username=username;
