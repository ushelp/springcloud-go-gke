FROM maven:3.5-jdk-8-alpine as builder

WORKDIR /app
COPY pom.xml ./
COPY src ./src/

RUN mvn package -DskipTests

FROM adoptopenjdk/openjdk8:jdk8u202-b08-alpine-slim

COPY --from=builder /app/target/gcp-provider-*.jar /gcp-provider.jar

CMD ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/gcp-provider.jar"]