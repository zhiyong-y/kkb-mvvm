/*
    数据响应式
*/
// 为了实现数组的响应式，需要重写数组的原型方法
const originPrototype = Array.prototype; // 空数组
const newArrPrototype = Object.create(originPrototype)
const methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]
methods.forEach(method => {
    // 重新准备数组原型方法，放在newArrPrototype上
    newArrPrototype[method] = function(){
        // 获取原来的对应的原型方法
        originPrototype[method].apply(this, arguments);
    }
})


// 模拟defineReactive
let defineReactive = (obj, key, value) => {
    // 递归调用，判断value是否也是对象，用于把深层对象设置成响应式属性
    observer(value);

    // obj 传入对象； key监听的属性； value初始值；
    // 拦截传入的参数，进行判断，是否发生数据变化
    // defindReactive对数组的拦截无效，需要修改原型
    Object.defineProperty(obj, key, {
        get() {
            console.log('get: ' + key);
            return value;
        },
        set(newValue) {
            if (newValue !== value) {
                // 为了防止传进来的也是一个对象，set的时候也要调用observer
                observer(newValue);
                console.log('set: ' + key + ', value: ' + newValue);
                value = newValue;
            }
        }
    })
}

let observer = function(obj){
    // 数组相关的方法是需要单独处理的
    if(typeof obj === 'object' && obj != null){
        // 增加对数组的判断
        if(Array.isArray(obj)){
            // 重新指定对象原型
            obj.__proto__ = newArrPrototype;
            // 遍历数组元素，创建响应式
            for (let i = 0; i < obj.length; i++) {
                // 如果是多维数组，递归调用
                observer(obj[i])
            }
        }else{
            // 获取obj的所有key
            let allKey = Object.keys(obj);
            // 遍历所有key，让每个属性都变成响应式属性
            allKey.forEach(key => {
                defineReactive(obj, key, obj[key]);
            })
        }
    }
}

// 新增属性方法
let set = function(obj, key, value){
    // set中会有各种判断
    // 新增属性的时候，同步要把新增的属性设置成响应式属性
    if(typeof obj === 'object'){
        // obj[key] = value;
        defineReactive(obj, key, value)
    }
}

// 测试数据
const obj = { foo: 'foo', bar: 'bar', baz: { sub: 10, arr: [1,2,3,88] }, ooo: [12] };
observer(obj)
// 删除属性
// delete obj.foo
// 新增属性
// obj.addProp = 'new'
set(obj, 'addProp', 'newProp')

obj.foo
obj.baz
obj.foo = 'fooooooo';
obj.baz.sub = 1023;

// 新增属性，没有处理成响应式属性，所以获取属性的时候，不会触发get
// 把新增的属性，设置成响应式属性
obj.addProp
obj.addProp = 'qwe'

// 深度获取数组
obj.baz.arr
// Object.defineProperty 对数组无效
// 解决方案： 修改数组实例的原型方法覆盖掉pop，push等等
obj.ooo.push(22)

console.log(typeof obj.ooo);
console.log(obj.ooo);