# 智谱清言智能体API转OpenAI接口

[![](https://img.shields.io/github/license/llm-red-team/zhipuai-agent-to-openai.svg)](LICENSE)
![](https://img.shields.io/github/stars/llm-red-team/zhipuai-agent-to-openai.svg)
![](https://img.shields.io/github/forks/llm-red-team/zhipuai-agent-to-openai.svg)
![](https://img.shields.io/docker/pulls/vinlic/zhipuai-agent-to-openai.svg)

这是一个将[智谱清言](https://chatglm.cn/)官方[智能体API](https://zhipu-ai.feishu.cn/wiki/X8ykw4IXpieCOxkYxbrcxT9vn5f)转换为OpenAI兼容协议的网关👋，帮助开发者们降低接入API的门槛。

## 特性

- ✅ 支持非流式/流式响应
- ✅ 支持对话补全
- ✅ 支持联网搜索
- ✅ 支持代码执行
- ✅ 支持图像生成
- ✅ 支持长文档解读
- ✅ 支持多模态图像解析

## 目录

* [APIKey获取](#APIKey获取)
* [Docker部署](#Docker部署)
  * [Docker-compose部署](#Docker-compose部署)
* [原生部署](#原生部署)
* [接口列表](#接口列表)
  * [对话补全](#对话补全)
  * [AI绘图](#AI绘图)
  * [文档解读](#文档解读)
  * [图像解析](#图像解析)
* [注意事项](#注意事项)
  * [Nginx反代优化](#Nginx反代优化)
* [Star History](#star-history)

## APIKey获取

前往智谱清言智能体[创作者中心](https://chatglm.cn/developersPanel/apiSet)创建API Key，并使用`.`拼接Key与Secret为API Key，如下所示：

```
21a**********9a0.2f****************************37
```

## Docker部署

请准备一台具有公网IP的服务器并将8000端口开放。

拉取镜像并启动服务

```shell
docker run -it -d --init --name zhipuai-agent-to-openai -p 8000:8000 -e TZ=Asia/Shanghai vinlic/zhipuai-agent-to-openai:latest
```

查看服务实时日志

```shell
docker logs -f zhipuai-agent-to-openai
```

重启服务

```shell
docker restart zhipuai-agent-to-openai
```

停止服务

```shell
docker stop zhipuai-agent-to-openai
```

### Docker-compose部署

```yaml
version: '3'

services:
  zhipuai-agent-to-openai:
    container_name: zhipuai-agent-to-openai
    image: vinlic/zhipuai-agent-to-openai:latest
    restart: always
    ports:
      - "8000:8000"
    environment:
      - TZ=Asia/Shanghai
```

## 原生部署

请准备一台具有公网IP的服务器并将8000端口开放。

请先安装好Node.js环境并且配置好环境变量，确认node命令可用。

安装依赖

```shell
npm i
```

安装PM2进行进程守护

```shell
npm i -g pm2
```

编译构建，看到dist目录就是构建完成

```shell
npm run build
```

启动服务

```shell
pm2 start dist/index.js --name "zhipuai-agent-to-openai"
```

查看服务实时日志

```shell
pm2 logs zhipuai-agent-to-openai
```

重启服务

```shell
pm2 reload zhipuai-agent-to-openai
```

停止服务

```shell
pm2 stop zhipuai-agent-to-openai
```

## 接口列表

### 对话补全

对话补全接口，与openai的 [chat-completions-api](https://platform.openai.com/docs/guides/text-generation/chat-completions-api) 兼容。

**POST /v1/chat/completions**

header 需要设置 Authorization 头部：

```
Authorization: Bearer [API Key]
```

请求数据：
```json
{
    // 必须填写您自己创建的智能体ID，否则无法调用成功
    "model": "65d6ba38fca9900836172419",
    // 目前多轮对话基于消息合并实现，某些场景可能导致能力下降且受单轮最大token数限制
    // 如果您想获得原生的多轮对话体验，可以传入首轮消息获得的id，来接续上下文
    // "conversation_id": "65f6c28546bae1f0fbb532de",
    "messages": [
        {
            "role": "user",
            "content": "你叫什么？"
        }
    ],
    // 如果使用SSE流请设置为true，默认false
    "stream": false
}
```

响应数据：
```json
{
    // 如果想获得原生多轮对话体验，此id，你可以传入到下一轮对话的conversation_id来接续上下文
    "id": "65f6c28546bae1f0fbb532de",
    "model": "65c046a531d3fcb034918abe",
    "object": "chat.completion",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "我叫智谱清言，是基于智谱 AI 公司于 2023 年训练的 ChatGLM 开发的。我的任务是针对用户的问题和要求提供适当的答复和支持。"
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 1,
        "completion_tokens": 1,
        "total_tokens": 2
    },
    "created": 1710152062
}
```

### AI绘图

对话补全接口，与openai的 [images-create-api](https://platform.openai.com/docs/api-reference/images/create) 兼容。

**POST /v1/images/generations**

header 需要设置 Authorization 头部：

```
Authorization: Bearer [API Key]
```

请求数据：
```json
{
    // 必须填写您自己创建的智能体ID，否则无法调用成功
    "model": "65d6ba38fca9900836172419",
    "prompt": "一只可爱的猫"
}
```

响应数据：
```json
{
    "created": 1711507449,
    "data": [
        {
            "url": "https://sfile.chatglm.cn/testpath/5e56234b-34ae-593c-ba4e-3f7ba77b5768_0.png"
        }
    ]
}
```

### 文档解读

提供一个可访问的文件URL或者BASE64_URL进行解析。

**POST /v1/chat/completions**

header 需要设置 Authorization 头部：

```
Authorization: Bearer [API Key]
```

请求数据：
```json
{
    // 必须填写您自己创建的智能体ID，否则无法调用成功
    "model": "65d6ba38fca9900836172419",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "file",
                    "file_url": {
                        "url": "https://mj101-1317487292.cos.ap-shanghai.myqcloud.com/ai/test.pdf"
                    }
                },
                {
                    "type": "text",
                    "text": "文档里说了什么？"
                }
            ]
        }
    ],
    // 如果使用SSE流请设置为true，默认false
    "stream": false
}
```

响应数据：
```json
{
    "id": "663e4b9b91634d28460fdd74",
    "model": "65d6ba38fca9900836172419",
    "object": "chat.completion",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "根据文档内容，我总结如下：\n\n这是一份关于希腊罗马时期的魔法咒语和仪式的文本，包含几个魔法仪式：\n\n1. 一个涉及面包、仪式场所和特定咒语的仪式，用于使某人爱上你。\n\n2. 一个针对女神赫卡忒的召唤仪式，用来折磨某人直到她自愿来到你身边。\n\n3. 一个通过念诵爱神阿芙罗狄蒂的秘密名字，连续七天进行仪式，来赢得一个美丽女子的心。\n\n4. 一个通过燃烧没药并念诵咒语，让一个女子对你产生强烈欲望的仪式。\n\n这些仪式都带有魔法和迷信色彩，使用各种咒语和象征性行为来影响人的感情和意愿。"
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 1,
        "completion_tokens": 1,
        "total_tokens": 2
    },
    "created": 100920
}
```

### 图像解析

提供一个可访问的图像URL或者BASE64_URL进行解析。

此格式兼容 [gpt-4-vision-preview](https://platform.openai.com/docs/guides/vision) API格式，您也可以用这个格式传送文档进行解析。

**POST /v1/chat/completions**

header 需要设置 Authorization 头部：

```
Authorization: Bearer [API Key]
```

请求数据：
```json
{
    "model": "65c046a531d3fcb034918abe",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "http://1255881664.vod2.myqcloud.com/6a0cd388vodbj1255881664/7b97ce1d3270835009240537095/uSfDwh6ZpB0A.png"
                    }
                },
                {
                    "type": "text",
                    "text": "图像描述了什么？"
                }
            ]
        }
    ],
    "stream": false
}
```

响应数据：
```json
{
    "id": "65f6c28546bae1f0fbb532de",
    "model": "65c046a531d3fcb034918abe",
    "object": "chat.completion",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "图片中展示的是一个蓝色背景下的logo，具体地，左边是一个由多个蓝色的圆点组成的圆形图案，右边是“智谱·AI”四个字，字体颜色为蓝色。"
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 1,
        "completion_tokens": 1,
        "total_tokens": 2
    },
    "created": 1710670469
}
```

## 注意事项

### Nginx反代优化

如果您正在使用Nginx反向代理，请添加以下配置项优化流的输出效果，优化体验感。

```nginx
# 关闭代理缓冲。当设置为off时，Nginx会立即将客户端请求发送到后端服务器，并立即将从后端服务器接收到的响应发送回客户端。
proxy_buffering off;
# 启用分块传输编码。分块传输编码允许服务器为动态生成的内容分块发送数据，而不需要预先知道内容的大小。
chunked_transfer_encoding on;
# 开启TCP_NOPUSH，这告诉Nginx在数据包发送到客户端之前，尽可能地发送数据。这通常在sendfile使用时配合使用，可以提高网络效率。
tcp_nopush on;
# 开启TCP_NODELAY，这告诉Nginx不延迟发送数据，立即发送小数据包。在某些情况下，这可以减少网络的延迟。
tcp_nodelay on;
# 设置保持连接的超时时间，这里设置为120秒。如果在这段时间内，客户端和服务器之间没有进一步的通信，连接将被关闭。
keepalive_timeout 120;
```

[![Star History Chart](https://api.star-history.com/svg?repos=LLM-Red-Team/zhipuai-agent-to-openai&type=Date)](https://star-history.com/#LLM-Red-Team/zhipuai-agent-to-openai&Date)
