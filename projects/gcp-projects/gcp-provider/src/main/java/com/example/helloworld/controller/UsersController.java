package com.example.helloworld.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RefreshScope
public class UsersController {
	
	@Value("${app.name:JAY}")
	private String name;

	@RequestMapping(value = "/users", method = {RequestMethod.GET})
	public String getUser() {
		return name;
	}
	
}
