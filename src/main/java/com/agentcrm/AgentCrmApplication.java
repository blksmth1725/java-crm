package com.agentcrm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AgentCrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgentCrmApplication.class, args);
    }
}
