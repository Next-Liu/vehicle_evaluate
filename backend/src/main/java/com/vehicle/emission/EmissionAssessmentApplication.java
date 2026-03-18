package com.vehicle.emission;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 机动车管控政策效益评估系统 - 主应用程序
 *
 * @author Emission Assessment Team
 * @since 2026-02-02
 */
@SpringBootApplication
@EnableScheduling
@MapperScan("com.vehicle.emission.mapper")
public class EmissionAssessmentApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmissionAssessmentApplication.class, args);
        System.out.println("""

                =====================================================
                  机动车管控政策效益评估系统启动成功！
                  Vehicle Emission Assessment System Started!

                  访问地址: http://localhost:8080/api
                  Swagger文档: http://localhost:8080/api/doc.html
                =====================================================
                """);
    }
}
