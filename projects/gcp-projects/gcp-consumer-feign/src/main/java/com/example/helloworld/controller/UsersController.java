package com.example.helloworld.controller;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import com.example.helloworld.feign.UsersClient;


@RestController
@RefreshScope
public class UsersController {

	Logger logger = LoggerFactory.getLogger(UsersController.class);
	
//	@Value("${app.hey}")
//	private String hey;


	@Resource
	UsersClient usersClient;
	
	@RequestMapping(value = "/users", method = {RequestMethod.GET})
	public Map<String, Object> getUser() {
		logger.info("[Consumer] UsersController.getUser");
		
		String name = usersClient.getUser();
		
		Map<String, Object> data=new HashMap<String, Object>();
		data.put("code", 0);
//		data.put("msg", "ok: "+hey);
		data.put("msg", "ok");
		data.put("data", name);
		return data;
	}

}
