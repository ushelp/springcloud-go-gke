package com.example.helloworld.controller;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;


@RestController
public class UsersController {

	Logger logger = LoggerFactory.getLogger(UsersController.class);

	/**
	 * Service Id
	 */
	private static final String SERVICE_PREFIX = "http://gcp-provider/";

	@Resource
	RestTemplate restTemplate;
	
	
	@RequestMapping(value = "/users", method = {RequestMethod.GET})
	@HystrixCommand(fallbackMethod = "getUserFallback")
	public Map<String, Object> getUser() {
		logger.info("[Consumer] UsersController.getUser");
		
		String url = SERVICE_PREFIX + "users";
		
		String name = restTemplate.getForObject(url, String.class);
		
		Map<String, Object> data=new HashMap<String, Object>();
		data.put("code", 0);
		data.put("msg", "ok");
		data.put("data", name);
		return data;
	}
	

	public Map<String, Object> getUserFallback() {
		logger.info("UsersClient.getUser fallback！");
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("code", 1);
		result.put("msg", "error");
		result.put("data", "UNKNOW");
		return result;
	}

	

}
