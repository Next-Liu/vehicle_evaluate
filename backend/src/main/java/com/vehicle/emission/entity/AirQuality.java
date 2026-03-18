package com.vehicle.emission.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 空气质量监测数据
 *
 * @author Emission Assessment Team
 */
@Data
@TableName("air_quality")
public class AirQuality {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 监测站点ID
     */
    private String stationId;

    /**
     * 监测站点名称
     */
    private String stationName;

    /**
     * 经度
     */
    private BigDecimal longitude;

    /**
     * 纬度
     */
    private BigDecimal latitude;

    /**
     * 监测时间
     */
    private LocalDateTime monitorTime;

    /**
     * PM2.5浓度 (μg/m³)
     */
    private BigDecimal pm25;

    /**
     * PM10浓度 (μg/m³)
     */
    private BigDecimal pm10;

    /**
     * NO2浓度 (μg/m³)
     */
    private BigDecimal no2;

    /**
     * SO2浓度 (μg/m³)
     */
    private BigDecimal so2;

    /**
     * O3浓度 (μg/m³)
     */
    private BigDecimal o3;

    /**
     * CO浓度 (mg/m³)
     */
    private BigDecimal co;

    /**
     * 空气质量指数
     */
    private Integer aqi;

    /**
     * 首要污染物
     */
    private String primaryPollutant;

    /**
     * 空气质量等级
     */
    private String qualityLevel;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
