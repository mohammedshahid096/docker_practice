### 3. Set Up Redis

You will need Redis for caching and session management. You can either install Redis locally or use a cloud-based solution like [Redis Cloud](https://redis.com/solutions/cloud/).

##### To set up Redis locally using Docker:

```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

### Running in interactive mode of redis-cli (termail)

```bash
docker exec -it redis-docker redis-cli
```
