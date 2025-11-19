## 已实现的 RAG 系统

### 核心功能

1. **文档处理与向量化**
   - 使用 LangChain 加载 PDF 教材
   - 使用 RecursiveCharacterTextSplitter 分块（512 字符，50 字符重叠）
   - 使用 OpenAI Embeddings 生成向量
   - 使用 Chroma 存储和检索向量

2. **检索增强生成 (RAG)**
   - 基于相似度的文档检索
   - 问答链（RetrievalQA）
   - 返回答案和来源文档

3. **Quiz 分析**
   - 分析 quiz PDF
   - 检查主题在教材中的覆盖度
   - 计算覆盖分数

4. **High Occurrence 检测**
   - 判断作业是否在测试中高频出现
   - 基于教材内容匹配和 quiz 相似度
   - 自动集成到标签生成系统

### API 接口

1. `POST /rag/build-vectorstore` - 构建向量数据库
2. `POST /rag/query` - 查询教材内容
3. `POST /rag/search` - 搜索相似内容
4. `POST /rag/analyze-quiz` - 分析 quiz PDF
5. `POST /rag/check-high-occurrence` - 检查是否高频出现

### 使用流程

1. 首次使用：构建向量数据库

```bash
curl -X POST "http://localhost:8000/rag/build-vectorstore" \
  -H "Content-Type: application/json" \
  -d '{"force_rebuild": false}'
```
* 首次分析作业时，如果向量数据库已构建，会自动检查 "High Occurrence in tests" 标签。

2. 分析作业时，系统会自动使用 RAG 检查是否 "High Occurrence in tests"

3. 可以单独查询或分析 quiz

* 如果确实需要重新构建：
```bash
curl -X POST "http://localhost:8000/rag/build-vectorstore" \
  -H "Content-Type: application/json" \
  -d '{"force_rebuild": true}'
```

### RAG 最佳实践

- 文档分块：512 字符，50 字符重叠
- 检索：Top 5 最相关块（k=5）
- Embeddings：OpenAI embeddings
- 向量数据库：Chroma（轻量、持久化）
- 重排序：使用相似度搜索

### 依赖库

- LangChain：RAG 框架
- Chroma：向量数据库
- OpenAI：Embeddings 和 LLM

