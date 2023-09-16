import Vue from 'vue'
import Router from 'vue-router';
import image_detail from "../pages/image_detail";
import container_detail from "../pages/container_detail";

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

const router =  new Router({
	mode: 'history',//改成history模式
	routes: [
		{
			path: '/',
			redirect:'/image',
		},
    {
      path: '/index',
      redirect:'/image',
    },
    {
      path:'/image',
      name:'镜像管理',
      component: image => require(['@/pages/image.vue'], image),
      meta:{
        title: '镜像管理',
      }
    },
    {
      path:'/image_detail',
      name:'镜像详情',
      component: image_detail => require(['@/pages/image_detail.vue'], image_detail),
      meta:{
        title: '镜像详情',
      }
    },
    {
      path:'/container',
      name:'容器管理',
      component: container => require(['@/pages/container.vue'], container),
      meta:{
        title: '容器管理',
      }
    },
    {
      path:'/container_detail',
      name:'容器详情',
      component: container_detail => require(['@/pages/container_detail.vue'], container_detail),
      meta:{
        title: '容器详情',
      }
    },
    {
      path:'/service',
      name:'应用部署',
      component: service => require(['@/pages/service.vue'], service),
      meta:{
        title: '应用部署',
      }
    },
    {
      path:'/service_detail',
      name:'应用详情',
      component: service_detail => require(['@/pages/service_detail.vue'], service_detail),
      meta:{
        title: '应用详情',
      }
    },
		{
			path: '*',
			redirect:'/index',
		},
  ],
});

export default router;
