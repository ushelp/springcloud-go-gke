package com.example.helloworld.feign;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.example.helloworld.feign.fallback.UsersClientFallback;



//@FeignClient(value = "users-provider", fallback = UsersClientFallback.class)
@FeignClient(name = "gcp-provider",url = "http://gcp-provider", fallback = UsersClientFallback.class)
//@FeignClient(name = "gcp-provider",url = "http://127.0.0.1:9000", fallback = UsersClientFallback.class)
public interface UsersClient {
	
	@RequestMapping(value = "/users", method = {RequestMethod.GET})
	public String getUser();
	
}
