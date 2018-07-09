import Vue from 'vue'
import Router from 'vue-router'
import feiyong from '@/components/feiyong'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'feiyong',
      component: feiyong
    }
  ]
})
