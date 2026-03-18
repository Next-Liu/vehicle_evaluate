package com.vehicle.emission.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.vehicle.emission.entity.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户Mapper
 *
 * @author Emission Assessment Team
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
