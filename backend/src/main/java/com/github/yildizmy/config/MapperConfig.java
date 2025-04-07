package com.github.yildizmy.config;

import com.github.yildizmy.dto.mapper.SignupRequestMapper;
import com.github.yildizmy.service.RoleService;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class MapperConfig {
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;

    public MapperConfig(PasswordEncoder passwordEncoder, RoleService roleService) {
        this.passwordEncoder = passwordEncoder;
        this.roleService = roleService;
    }
} 