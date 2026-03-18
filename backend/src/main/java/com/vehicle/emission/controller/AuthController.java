package com.vehicle.emission.controller;

import com.vehicle.emission.common.Result;
import com.vehicle.emission.dto.LoginRequest;
import com.vehicle.emission.dto.RegisterRequest;
import com.vehicle.emission.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 *
 * @author Emission Assessment Team
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("User login attempt: {}", request.getUsername());
        return Result.success(authService.login(request));
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("User registration attempt: {}", request.getUsername());
        authService.register(request);
        return Result.success("注册成功");
    }

    /**
     * 刷新Token
     */
    @PostMapping("/refresh")
    public Result<?> refreshToken(@RequestParam String refreshToken) {
        return Result.success(authService.refreshToken(refreshToken));
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public Result<?> logout() {
        return Result.success("登出成功");
    }
}
