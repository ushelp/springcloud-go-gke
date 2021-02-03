package com.example.helloworld.feign.fallback;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.example.helloworld.feign.UsersClient;


@Component
public class UsersClientFallback implements UsersClient {
	
	Logger logger = LoggerFactory.getLogger(UsersClientFallback.class);

	@Override
	public String getUser() {
		logger.info("UsersClient.getUser fallback！");
		return "UNKNOW";
	}
	
}
