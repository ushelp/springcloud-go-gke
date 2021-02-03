# Steps
1. POM:
    - Remove some springcloud dependencies
        - Eureka, Ribbon, Zipkin, Sleuth
    - Add springcloud GCP dependencies/dependencyManagement
        - Logging, Trace, Metrics Monitoring, Pub/Sub
    - Replace some springcloud dependencies
        - Rabbit, Kafka  Pub/Sub
2. Properties:
    - Remove some configuration
        - Eureka, Zuul, Ribbon, Zipkin, Discovery
    - Add some configuration
        - Logging, Trace, Metrics Monitoring, Sleuth, Hystrix
    - Replace some springcloud dependencies
        - ConfigServer
3. Code:
    - Remove some code
        - Annotations(@EnableDiscoveryClient, @EnableHystrixDashboard)
    - Replace some code
        - ConfigServer URL
        - Feign, RestTemplate
4. Deployment Strategies：
    - Blue/Green
    - Recreate
    - Rolling update
5. Dockerfile:
