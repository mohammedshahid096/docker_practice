### Setup for RabbitMQ

[Reference](https://www.svix.com/resources/guides/rabbitmq-docker-setup-guide/)

#### Pull the official RabbitMQ image:

```bash
docker pull rabbitmq:3-management
```

#### Running a RabbitMQ Container

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Access the RabbitMQ Management Console:
Open a web browser and navigate to http://localhost:15672/.
Log in with the default username guest and password guest.

##### access the shell of one of the containers:

```bash
docker exec -it rabbitmq1 bash
```
