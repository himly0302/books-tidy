## 场景描述

通过对一次操作的完整处理，得到了一份最终的json数据文件，格式如下
```json
{
    "id": "5c7b5745-71ea-4107-9ded-8511d74acfd7",
    "name": "黎东方讲史",
    "author": "黎东方",
    "type": "历史",
    "pic": "历史/黎东方讲史/badb12e1.jpg",
    "sourceFolder": "黎东方讲史（套装共九册）- 黎东方",
    "addedAt": "2026-04-30T09:28:58.162Z",
    "bd_link": "https://pan.baidu.com/s/1ud-yUoJpTyYTcF_eaFCOFw?pwd=7exe",
    "picUrl": "https://teaax7941.hn-bkt.clouddn.com/books-tidy/5c7b5745-71ea-4107-9ded-8511d74acfd7.jpg"
}
```

## 想要的效果

生成一份execl文件

1. 按类型分成多个sheet

2. 每条数据包含 书名(name)、作者(author)、类型(type)、百度云盘(bd_link)、添加时间(具体到日)

