渲染引擎的嵌套层级
Render -> RenderLayout(布局) -> RenderStructuralComponents(结构组件) -> RenderComponents(基础组件)

store目前存了
1、ds索引(各组件之间互相调用ds)
2、loadingKey，当某个接口按钮被触发时，loadingKey设置为对应按钮的唯一id，按钮的loading={ laodingKey && button.id !== laodingKey }
