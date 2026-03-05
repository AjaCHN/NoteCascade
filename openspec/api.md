# API 接口文档

## 概述
NoteCascade 主要是一个客户端应用。大多数交互通过 Web MIDI API 和内部状态管理处理。

## OpenAPI 规范 (Placeholder)
```yaml
openapi: 3.0.0
info:
  title: NoteCascade API
  version: 1.0.0
paths:
  /api/songs:
    get:
      summary: 获取所有歌曲
      responses:
        '200':
          description: 歌曲列表
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id: { type: string }
                    title: { type: string }
```
