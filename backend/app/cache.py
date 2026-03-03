from app.config import settings

redis_client = None


async def get_redis():
    global redis_client
    if not settings.REDIS_URL:
        return None
    if redis_client is None:
        from redis.asyncio import Redis
        redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    return redis_client


async def get_cached(key: str) -> str | None:
    r = await get_redis()
    if r is None:
        return None
    return await r.get(key)


async def set_cached(key: str, value: str, ttl: int = 300) -> None:
    r = await get_redis()
    if r is None:
        return
    await r.set(key, value, ex=ttl)


async def invalidate_pattern(pattern: str) -> None:
    r = await get_redis()
    if r is None:
        return
    async for key in r.scan_iter(match=pattern):
        await r.delete(key)
