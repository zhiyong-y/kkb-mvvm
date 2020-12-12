
let observe = function (obj) {
    if (typeof obj === 'object' && obj != null) {
        // 创建Observer实例
        new Observer(obj);
    }
}
// 模拟defineReactive
let defineReactive = (obj, key, value) => {
    // 递归调用，判断value是否也是对象，用于把深层对象设置成响应式属性
    observe(value);

    // 创建Dep，关联指定的key
    let dep = new Dep();

    // obj 传入对象； key监听的属性； value初始值；
    // 拦截传入的参数，进行判断，是否发生数据变化
    // defindReactive对数组的拦截无效，需要修改原型
    Object.defineProperty(obj, key, {
        get() {
            console.log('get: ' + key);
            // 所有的依赖收集发生在getter
            // 因为在Watcher中已经将watcher的实例挂载到了Dep.target上
            Dep.target && dep.addDep(Dep.target)
            console.log('-------------');
            console.log(dep);
            console.log('-------------');
            return value;
        },
        set(newValue) {
            // 所有的执行更新发生在setter
            if (newValue !== value) {
                console.log('set: ' + key + ', value: ' + newValue);
                
                value = newValue;
                dep.notify();
            }
        }
    })
}
let proxy = function (vm, sourceKey) {
    console.log(vm, sourceKey);
    // 拿到this.$data这个对象，并去遍历对象中的属性
    Object.keys(vm[sourceKey]).forEach(key => {
        // 此处作用是将$data的所有key代理到vm上
        Object.defineProperty(vm, key, {
            get() {
                return vm[sourceKey][key];
            },
            set(newValue) {
                vm[sourceKey][key] = newValue;
            }
        })
    })

}

// 创建kVue的构造函数
class kVue {
    constructor(options) {
        // 保存options
        this.$options = options;
        this.$data = options.data;
        this.$methods = options.methods;
        // 实例化的时候只有data中的数据需要实现响应化
        // 处理响应化的时候需要判断传入的参数是对象还是数组
        observe(this.$data);

        // 代理this中的$data
        proxy(this, '$data');
        proxy(this, '$methods')

        // 编译
        new Compiler(this.$options.el, this)
    }
}

// 创建劫持监听
class Observer {
    constructor(value) {
        this.value = value;
        // 判断value的类型：对象or数组
        if (typeof value === 'object' && value != null && !Array.isArray(value)) {
            this.walk(value)
        } else {
            // 判断value是数组类型
        }
    }
    // 对象
    walk(obj) {
        Object.keys(obj).forEach(key => {
            defineReactive(obj, key, obj[key]);
        })
    }
    // 数组
}

// 创建观察者
class Watcher{
    constructor(vm, key, fn){
        this.vm = vm;
        this.key = key;
        this.updateFn = fn;

        // 当前watcher赋值给target
        Dep.target = this;
        // 因为依赖收集发生在getter阶段，所以主动触发getter，将对应key的watcher收集到dep中
        this.vm[this.key];
        // 当前key的依赖收集完成后，立即释放target
        Dep.target = null;

    }
    update(){
        this.updateFn.call(this.vm, this.vm[this.key]);
    }
}

// 依赖收集
// 管理某个key对应的所有的watcher
class Dep {
    constructor(){
        this.deps = [];
    }
    addDep(dep){
        this.deps.push(dep)
    }
    notify(){
        this.deps.forEach(dep => {
            console.log(dep);
            dep.update();
        })
    }
}