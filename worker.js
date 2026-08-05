// 国中行银综合录入训练 —— Cloudflare Worker 入口
// 静态资源（HTML/CSS/JS）由 Workers Assets 托管；此脚本仅在请求未命中
// 任何静态资源时被调用，将请求转交给 assets 绑定按 not_found_handling 处理。
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
