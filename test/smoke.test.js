/* 冒烟测试：用 jsdom 真实加载 index.html + app.js，验证核心交互路径 */
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

let failures = 0;
function assert(cond, msg) {
  if (cond) { console.log('  ✔ ' + msg); }
  else { failures++; console.error('  ✘ FAIL: ' + msg); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/index.html', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
window.innerWidth = 1280; // 宽屏

window.eval(fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8'));
document.dispatchEvent(new window.Event('DOMContentLoaded'));

(async () => {
  console.log('1) 初始渲染');
  const navItems = document.querySelectorAll('#sidebarNav .nav-item');
  assert(navItems.length === 5, `侧边栏渲染 5 个 tab（实际 ${navItems.length}）`);
  assert([...navItems].some(a => a.textContent.includes('中文训练')), '侧边栏含「中文训练」tab');
  assert(!document.body.classList.contains('sidebar-collapsed'), '宽屏下侧边栏默认完整显示（未收起）');
  assert(document.querySelector('#sidebarNav .nav-item.active')?.textContent.includes('综合录入训练'), '默认激活「综合录入训练」');
  assert(document.querySelectorAll('.pre-table tbody tr').length === 50, '预录表格 50 行数据');
  assert(document.querySelectorAll('.input-table tbody tr').length === 50, '录入表格 50 行空白输入行');
  assert(document.querySelectorAll('.input-table tbody input').length === 50 * 8, `录入表格共 ${50 * 8} 个输入框（50 行 × 8 列）`);
  assert(!!document.querySelector('.box-pre'), '预录表置于固定高度可滚动容器 box-pre');
  assert(!!document.querySelector('.box-input'), '录入表置于固定高度可滚动容器 box-input');
  const preCols = [...document.querySelectorAll('.pre-table colgroup col')].map(c => c.className);
  const inputCols = [...document.querySelectorAll('.input-table colgroup col')].map(c => c.className);
  assert(preCols.length === 9 && inputCols.length === 9, '两表均有 9 列宽定义');
  assert(JSON.stringify(preCols) === JSON.stringify(inputCols), '预录表与录入表列宽定义完全一致（上下对齐）');
  assert(document.getElementById('timerValue').textContent === '10:00', '倒计时初始显示 10:00');
  assert(document.getElementById('timerState').textContent === '未开始', '倒计时状态为「未开始」');
  const curCell = document.querySelector('.pre-table tbody tr td:nth-child(4)');
  assert(curCell.textContent.includes('DKK'), '预录表第 1 行币种代码含字母代码 DKK');
  assert(curCell.querySelector('.cur-num')?.textContent === '22', '预录表第 1 行币种代码含红色加粗编号 22');

  console.log('2) 未开始时提交核对 → 提示先聚焦');
  document.getElementById('btnSubmit').click();
  assert(document.getElementById('checkResult').textContent.includes('请先将光标移入录入表格'), '提示先将光标移入录入表格');

  console.log('3) 焦点进入录入表自动计时，移出自动暂停');
  const firstInput = document.querySelector('.input-table input');
  firstInput.focus();
  assert(document.getElementById('timerState').textContent === '进行中', '聚焦后自动开始计时（状态「进行中」）');
  await sleep(1300);
  assert(document.getElementById('timerValue').textContent !== '10:00', `倒计时走动（当前 ${document.getElementById('timerValue').textContent}）`);
  firstInput.blur();
  await sleep(30);
  assert(document.getElementById('timerState').textContent === '已暂停', '焦点移出后计时暂停（状态「已暂停」）');
  firstInput.focus();
  assert(document.getElementById('timerState').textContent === '进行中', '再次聚焦后计时继续');

  console.log('4) 全部填对 → 准确率 100%');
  const preData = [...document.querySelectorAll('.pre-table tbody tr')]
    .map(tr => [...tr.querySelectorAll('td')].map(td => {
      const n = td.querySelector('.cur-num');
      return n ? n.textContent : td.textContent;
    }));
  const rows = document.querySelectorAll('.input-table tbody tr');
  rows.forEach((tr, i) => {
    const ins = tr.querySelectorAll('input');
    for (let k = 0; k < ins.length; k++) ins[k].value = preData[i][k + 1]; // 跳过序号列，币别取编号
  });
  document.getElementById('btnSubmit').click();
  const result = document.getElementById('checkResult');
  assert(result.textContent.includes('正确 50 条') && result.textContent.includes('错误 0 条'), '统计显示正确 50 条、错误 0 条');
  assert(result.textContent.includes('准确率 100.0%'), '准确率 100.0%');
  assert(!!result.querySelector('.bar.ok'), '显示绿色「核对通过」结果条');
  assert(document.querySelectorAll('.input-table input.error').length === 0, '全对时无错误标红');

  console.log('5) 制造 2 处错误 → 准确率 90%');
  rows[1].querySelectorAll('input')[0].value = '错误名字';     // 第 2 行姓名不一致
  rows[2].querySelectorAll('input')[2].value = '99';          // 第 3 行币别填不存在的编号（格式错误）
  document.getElementById('btnSubmit').click();
  assert(result.textContent.includes('正确 48 条') && result.textContent.includes('错误 2 条'), '统计显示正确 48 条、错误 2 条');
  assert(result.textContent.includes('准确率 96.0%'), '准确率 96.0%');
  assert(!!result.querySelector('.bar.warn'), '显示警告结果条');
  assert(document.querySelectorAll('.input-table input.error').length === 2, '恰好 2 个错误单元格标红框红字');
  const detail = result.textContent;
  assert(detail.includes('第 2 行「姓名」') && detail.includes('错误名字'), '明细指出第 2 行姓名不一致');
  assert(detail.includes('第 3 行「币种代码」编号不存在'), '明细指出第 3 行币种代码编号不存在');
  assert(rows[1].querySelectorAll('input')[0].classList.contains('error'), '不一致单元格标红');

  console.log('6) 币别格式校验（填字母代码）');
  rows[3].querySelectorAll('input')[2].value = 'SGD';
  document.getElementById('btnSubmit').click();
  assert(result.textContent.includes('应填写 2 位数字编号'), '提示币别应填写 2 位数字编号');

  console.log('7) 空字段不再罗列「不能为空」明细，但仍标红并计错');
  rows[5].querySelectorAll('input')[0].value = '';      // 第 6 行姓名留空
  rows[5].querySelectorAll('input')[5].value = '';      // 第 6 行账户类别留空
  document.getElementById('btnSubmit').click();
  assert(!result.textContent.includes('不能为空'), '明细不再出现「不能为空」');
  assert(result.textContent.includes('正确 46 条') && result.textContent.includes('错误 4 条'), '留空行计入错误统计');
  assert(rows[5].querySelectorAll('input')[0].classList.contains('error'), '空字段仍标红框');

  console.log('8) 重置录入 与 重新训练');
  document.getElementById('btnReset').click();
  const empties = [...document.querySelectorAll('.input-table input')].every(i => i.value === '');
  assert(empties, '「重置录入」清空所有输入框');
  assert(document.querySelectorAll('.input-table input.error').length === 0, '错误标记被清除');
  assert(document.getElementById('checkResult').innerHTML === '', '核对结果被清空');
  document.getElementById('btnResetAll').click();
  assert(document.getElementById('timerValue').textContent === '10:00', '「重新训练」重置倒计时为 10:00');
  assert(document.getElementById('timerState').textContent === '未开始', '「重新训练」状态回到「未开始」');
  assert([...document.querySelectorAll('.input-table input')].every(i => i.value === ''), '「重新训练」清空录入');

  console.log('9) 侧边栏收起 / 展开');
  document.getElementById('sidebarToggle').click();
  assert(document.body.classList.contains('sidebar-collapsed'), '点击后 body 添加 sidebar-collapsed');
  document.getElementById('sidebarToggle').click();
  assert(!document.body.classList.contains('sidebar-collapsed'), '再次点击后恢复展开');

  console.log('10) tab 跳转：中文训练（开发中）');
  window.location.hash = '#/chinese-training';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  assert(document.querySelector('.page-head h2')?.textContent === '中文训练', '中文训练页显示标题');
  assert(document.querySelector('.placeholder .card h3')?.textContent.includes('开发中'), '显示「开发中」提示');
  assert(!!document.querySelector('.btn-back'), '含「返回综合录入训练」入口');
  document.querySelector('.btn-back').click();
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  assert(document.querySelector('#sidebarNav .nav-item.active')?.dataset.id === 'train', '点击返回回到综合录入训练');
  assert(document.querySelector('.pre-table tbody tr'), '返回后重新渲染训练页');

  console.log('11) tab 跳转：占位练习页');
  window.location.hash = '#/new-practice-1';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  assert(document.querySelector('#sidebarNav .nav-item.active')?.dataset.id === 'new-practice-1', '激活 tab 切换为「新练习」');
  assert(document.querySelector('.placeholder .card h3')?.textContent.includes('尚未添加'), '显示占位页「尚未添加」');
  document.querySelector('.placeholder .btn-back').click();
  window.dispatchEvent(new window.HashChangeEvent('hashchange')); // jsdom 不自动触发 hash 导航，手动补发（浏览器中点击即触发）
  assert(document.querySelector('#sidebarNav .nav-item.active')?.dataset.id === 'train', '返回并重新激活「综合录入训练」');
  assert(document.querySelector('.pre-table tbody tr'), '返回后重新渲染综合录入训练页');

  console.log('12) 题库切换（共 3 套）');
  assert(document.querySelectorAll('.bank-btn').length === 3, '综合训练页含 3 个题库按钮');
  assert(document.querySelector('.bank-btn.active')?.dataset.bank === '0', '默认第 1 套激活');
  assert(document.querySelector('.pre-table tbody tr td:nth-child(2)').textContent === '龙星通', '第 1 套预录首行姓名');
  document.querySelectorAll('.bank-btn')[1].click();
  assert(document.querySelector('.bank-btn.active')?.dataset.bank === '1', '点击后切换到第 2 套');
  assert(document.querySelector('.pre-table tbody tr td:nth-child(2)').textContent === '张海涛', '第 2 套预录首行姓名');
  assert(document.getElementById('timerValue').textContent === '10:00' && document.getElementById('timerState').textContent === '未开始', '切换题库后计时重置');
  assert([...document.querySelectorAll('.input-table input')].every(i => i.value === ''), '切换题库后录入清空');
  document.querySelectorAll('.bank-btn')[2].click();
  assert(document.querySelector('.pre-table tbody tr td:nth-child(2)').textContent === '陈志明', '第 3 套预录首行姓名');
  document.querySelectorAll('.bank-btn')[0].click();
  assert(document.querySelector('.pre-table tbody tr td:nth-child(2)').textContent === '龙星通', '切回第 1 套');

  console.log('13) 表格框内滚动幅度缩小 1/3');
  const scrollBox = document.querySelector('.box-input');
  Object.defineProperty(scrollBox, 'scrollHeight', { value: 2000, configurable: true });
  Object.defineProperty(scrollBox, 'clientHeight', { value: 340, configurable: true });
  scrollBox.scrollTop = 0;
  scrollBox.dispatchEvent(new window.WheelEvent('wheel', { deltaY: 300, deltaX: 0, bubbles: true, cancelable: true }));
  assert(scrollBox.scrollTop === 200, `滚动幅度为 deltaY 的 2/3（实际 ${scrollBox.scrollTop}）`);

  console.log('14) Enter 键在录入表内换格');
  const navInputs = [...document.querySelectorAll('.input-table tbody input')];
  navInputs[0].focus();
  navInputs[0].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  assert(document.activeElement === navInputs[1], 'Enter 从第 1 格切到同行第 2 格');
  navInputs[7].focus(); // 第 1 行行末（地址列）
  navInputs[7].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  assert(document.activeElement === navInputs[8], '行末 Enter 切到下一行首格');
  const lastInput = navInputs[navInputs.length - 1];
  lastInput.focus();
  lastInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  assert(document.activeElement === lastInput, '最后一行行末 Enter 停在原地');
  navInputs[3].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true }));
  assert(document.activeElement === lastInput, '中文输入法组词 Enter 不换格');

  console.log('15) Tab 键在录入表内换格（行末跳下一行首）');
  navInputs[1].focus();
  navInputs[1].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  assert(document.activeElement === navInputs[2], 'Tab 从第 2 格切到同行第 3 格');
  navInputs[7].focus(); // 第 1 行行末
  navInputs[7].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  assert(document.activeElement === navInputs[8], '行末 Tab 切到下一行首格');
  lastInput.focus();
  lastInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  assert(document.activeElement === lastInput, '最后一行行末 Tab 停在原地（不跳出表格）');

  console.log('16) 页面底部版本号');
  assert(document.querySelector('.page-foot')?.textContent.includes('v1.0.6'), '训练页底部显示版本 v1.0.6');
  window.location.hash = '#/chinese-training';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  assert(document.querySelector('.page-foot')?.textContent.includes('v1.0.6'), '中文训练页底部显示版本号');
  window.location.hash = '#/new-practice-1';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  assert(document.querySelector('.page-foot')?.textContent.includes('v1.0.6'), '占位页底部显示版本号');

  console.log(failures === 0 ? '\n全部通过 ✔' : `\n${failures} 项失败 ✘`);
  process.exit(failures === 0 ? 0 : 1);
})();
