// 创建编译器
// 获取dom节点，遍历节点
// 判断节点类型：dom节点/文本节点
class Compiler {
    constructor(el, vm) {
        this.$el = document.querySelector(el);
        this.$vm = vm;

        if (this.$el) {
            this.compile(this.$el);
        }
    }
    compile(el) {
        // 获取子节点
        const childNodes = el.childNodes;
        // 遍历孩子节点，用于判断是dom节点还是文本节点
        Array.from(childNodes).forEach(node => {
            if (this.isElement(node)) {
                // console.log('元素节点');
                this.compileElement(node);
            } else if (this.isInter(node)) {
                // console.log('文本节点');
                this.compileText(node);
            }
            // 判断是否有子节点，递归调用
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node);
            }
        })
    }
    isElement(node) {
        return node.nodeType === 1;
    }
    isInter(node) {
        // 判断插值文本{{}}
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }
    compileText(node) {
        // 从实例中获取插值
        // 创建更新器后，会被抽取到公共方法中
        // node.textContent = this.$vm[RegExp.$1];
        // 创建更新器
        this.update(node, RegExp.$1, 'text');
    }
    compileElement(node) {
        // 遍历元素节点的属性
        const attrs = node.attributes;
        Array.from(attrs).forEach(attr => {
            // 获取指令名称
            const attrName = attr.name;
            // 判断是一般写法还是简写
            if (attrName.indexOf('-') > 0) {
                if (attrName.indexOf('on') > 0) {
                    const exp = attrName.substring(2, 4);
                    this[exp] && this[exp](attr, node);
                } else {
                    // 常规指令写法
                    const exp = attrName.substring(2);
                    this[exp] && this[exp](attr, node);
                }
            }
        })
    }
    update(node, exp, dir) {
        // 初始化操作
        const fn = this[dir+'Updater'];
        fn && fn(node, this.$vm[exp])

        // 更新操作
        // 在更新的时候创建一个watcher
        new Watcher(this.$vm, exp, function(value){
            fn && fn(node, value);
            //textUpdater
        })
    }
    textUpdater(node, value){
        node.textContent = value;
    }
    text(attribute, node) {
        this.update(node, attribute.value, 'text');
    }
    // 更新函数！！！
    htmlUpdater(node, value){
        node.innerHTML = value;
    }
    html(attribute, node) {
        this.update(node, attribute.value, 'html');
    }
    on(attribute, node) {
        node.addEventListener('click', this.$vm[attribute.value])
    }

}