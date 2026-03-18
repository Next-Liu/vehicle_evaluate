package com.vehicle.emission.service;

import com.vehicle.emission.dto.LoginRequest;
import com.vehicle.emission.dto.RegisterRequest;

import java.util.Map;

/**
 * 认证服务接口
 *
 * @author Emission Assessment Team
 */
public interface AuthService {

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return Token信息
     */
    Map<String, Object> login(LoginRequest request);

    /**
     * 用户注册
     *
     * @param request 注册请求
     */
    void register(RegisterRequest request);

    /**
     * 刷新Token
     *
     * @param refreshToken 刷新Token
     * @return 新的Token信息
     */
    Map<String, Object> refreshToken(String refreshToken);
}
