/* =========================================================
   国中行银 · 综合录入训练 —— 交互逻辑
   ========================================================= */
'use strict';

/* ---------------- 练习注册表 ----------------
 * 后期添加新练习页：只需在 EXERCISES 中追加一项。
 *  - id:          路由标识，访问地址为 #/<id>
 *  - name / icon: 侧边栏 tab 显示的文字与图标
 *  - render:      渲染该练习页面的函数（返回 HTML 字符串）
 *  - afterRender: 渲染完成后绑定事件的函数（可选）
 *  - placeholder: 设为 true 时显示"待添加"占位页，无需 render
 */
const EXERCISES = [
  {
    id: 'train',
    name: '综合录入训练',
    icon: '录',
    render: renderTrainPage,
    afterRender: initTrainPage,
  },
  {
    id: 'chinese-training',
    name: '中文训练',
    icon: '中',
    render: renderChinesePage,
  },
  {
    id: 'new-practice-1',
    name: '新练习（待添加）',
    icon: '新',
    placeholder: true,
  },
  {
    id: 'new-practice-2',
    name: '新练习（待添加）',
    icon: '新',
    placeholder: true,
  },
  {
    id: 'new-practice-3',
    name: '新练习（待添加）',
    icon: '新',
    placeholder: true,
  },
];

/* ---------------- 货币对照表（货币 / 字母代码 / 数字代码） ---------------- */
const CURRENCIES = [
  { name: '人民币',     code: 'RMB', num: '01' },
  { name: '英镑',       code: 'GBP', num: '12' },
  { name: '港币',       code: 'HKD', num: '13' },
  { name: '美元',       code: 'USD', num: '14' },
  { name: '瑞士法郎',   code: 'CHF', num: '15' },
  { name: '新加坡元',   code: 'SGD', num: '18' },
  { name: '瑞典克朗',   code: 'SEK', num: '21' },
  { name: '丹麦克朗',   code: 'DKK', num: '22' },
  { name: '挪威克朗',   code: 'NOK', num: '23' },
  { name: '日元',       code: 'JPY', num: '27' },
  { name: '加拿大元',   code: 'CAD', num: '28' },
  { name: '澳大利亚元', code: 'AUD', num: '29' },
  { name: '欧元',       code: 'EUR', num: '38' },
  { name: '澳门元',     code: 'MOP', num: '81' },
  { name: '菲律宾比索', code: 'PHP', num: '82' },
  { name: '泰国铢',     code: 'THB', num: '84' },
  { name: '新西兰元',   code: 'NZD', num: '87' },
];
const CURRENCY_BY_NUM  = new Map(CURRENCIES.map(c => [c.num, c]));

/* ---------------- 预录入信息题库（共 3 套，可在综合训练页切换） ----------------
 * 第 1 套前 6 条为原始训练数据，其余为扩展 mock 数据。
 * cur 为币别对象：code 字母代码（预录表展示），num 数字代码（录入表填写内容）。
 */
const COLUMNS = [
  { key: 'no',     label: '序号' },
  { key: 'name',   label: '姓名' },
  { key: 'id',     label: '身份证号' },
  { key: 'cur',    label: '币别' },
  { key: 'amount', label: '金额' },
  { key: 'type',   label: '储种' },
  { key: 'acct',   label: '账户类别' },
  { key: 'term',   label: '存期' },
  { key: 'addr',   label: '地址' },
];

const BANK_1 = [
  { no: '1',  name: '邢龚遥',   id: '510712200607153446', cur: { code: 'SGD', num: '18' }, amount: '246439', type: '5511', acct: '0623', term: '36', addr: '北京市门头沟区永定镇石龙路15号永定镇小区4号楼1单元503室' },
  { no: '2',  name: '叔孙燃',   id: '440104212503217995', cur: { code: 'GBP', num: '12' }, amount: '153486', type: '5502', acct: '0023', term: '12', addr: '安徽省芜湖市镜湖区中山路步行街1号侨鸿国际大厦A座18层1806室' },
  { no: '3',  name: '仇清禾',   id: '410101201012255667', cur: { code: 'HKD', num: '13' }, amount: '262832', type: '5515', acct: '0475', term: '36', addr: '上海市闵行区莘奉路958号莘城尚品2号楼3单元502室' },
  { no: '4',  name: '栾月朗',   id: '340107205808264629', cur: { code: 'CAD', num: '28' }, amount: '33253',  type: '5513', acct: '0183', term: '03', addr: '辽宁省阜新市细河区中华路168号宝地福湾B座14层1407室' },
  { no: '5',  name: '太叔大和', id: '150102197912247945', cur: { code: 'SGD', num: '18' }, amount: '187940', type: '5511', acct: '1018', term: '36', addr: '西藏自治区日喀则市桑珠孜区珠峰路2号日喀则步行街商务楼B座10层1003室' },
  { no: '6',  name: '令晨和',   id: '310112200111153446', cur: { code: 'SGD', num: '18' }, amount: '246448', type: '5528', acct: '0055', term: '18', addr: '北京市丰台区丰明路智文国际教研中心校区三层3099' },
  { no: '7',  name: '欧阳明轩', id: '110101199003152345', cur: { code: 'USD', num: '14' }, amount: '156789', type: '5501', acct: '0112', term: '12', addr: '北京市东城区王府井大街88号银泰中心A座12层1205室' },
  { no: '8',  name: '司马长风', id: '310101198506203218', cur: { code: 'CHF', num: '15' }, amount: '89231',  type: '5504', acct: '0301', term: '06', addr: '上海市黄浦区南京东路100号置地广场8楼806室' },
  { no: '9',  name: '慕容雪',   id: '440301199212053267', cur: { code: 'RMB', num: '01' }, amount: '45230',  type: '5506', acct: '0402', term: '03', addr: '广东省深圳市福田区深南大道2008号华强北电子市场3层312室' },
  { no: '10', name: '端木秋',   id: '210102198804112234', cur: { code: 'SEK', num: '21' }, amount: '321546', type: '5510', acct: '0521', term: '36', addr: '辽宁省沈阳市和平区太原街98号新世界百货5楼501室' },
  { no: '11', name: '南宫月',   id: '320103199501234567', cur: { code: 'DKK', num: '22' }, amount: '187654', type: '5512', acct: '0607', term: '18', addr: '江苏省南京市鼓楼区中山北路26号新晨国际大厦16层1602室' },
  { no: '12', name: '夏侯渊',   id: '330102198709123456', cur: { code: 'NOK', num: '23' }, amount: '265432', type: '5514', acct: '0714', term: '36', addr: '浙江省杭州市上城区延安路78号湖滨银泰in77C座9层903室' },
  { no: '13', name: '诸葛瑾',   id: '370102198203185678', cur: { code: 'JPY', num: '27' }, amount: '352100', type: '5516', acct: '0803', term: '12', addr: '山东省济南市历下区泉城路188号恒隆广场东塔15层1508室' },
  { no: '14', name: '上官婉儿', id: '410102198612254567', cur: { code: 'AUD', num: '29' }, amount: '42315',  type: '5517', acct: '0901', term: '03', addr: '河南省郑州市金水区花园路39号国贸中心2号楼10层1001室' },
  { no: '15', name: '东方朔',   id: '440102199301015678', cur: { code: 'EUR', num: '38' }, amount: '621054', type: '5518', acct: '1002', term: '18', addr: '广东省广州市越秀区环市东路371号世界贸易中心南塔20层2006室' },
  { no: '16', name: '西门吹雪', id: '510102199702153456', cur: { code: 'MOP', num: '81' }, amount: '158760', type: '5519', acct: '1105', term: '12', addr: '四川省成都市锦江区红星路三段1号国际金融中心IFS7层705室' },
  { no: '17', name: '独孤求败', id: '110108199401027654', cur: { code: 'PHP', num: '82' }, amount: '87654',  type: '5520', acct: '1206', term: '06', addr: '北京市海淀区中关村大街27号中关村大厦11层1103室' },
  { no: '18', name: '皇甫嵩',   id: '350102198907145678', cur: { code: 'THB', num: '84' }, amount: '198765', type: '5521', acct: '1308', term: '36', addr: '福建省福州市鼓楼区东街口大洋百货6楼602室' },
  { no: '19', name: '司徒静',   id: '440112199512346789', cur: { code: 'NZD', num: '87' }, amount: '234567', type: '5522', acct: '1409', term: '24', addr: '广东省广州市黄埔区科学大道99号科汇金谷A栋8层801室' },
  { no: '20', name: '令狐冲',   id: '330106199311125678', cur: { code: 'USD', num: '14' }, amount: '18765',  type: '5523', acct: '1507', term: '06', addr: '浙江省杭州市西湖区文三路259号昌地火炬大厦12层1201室' },
];

/* 第 2 套题库（20 条 mock） */
const BANK_2 = [
  { no: '1',  name: '张海涛',     id: '110105198503124567', cur: { code: 'USD', num: '14' }, amount: '123456', type: '5501', acct: '0211', term: '12', addr: '北京市朝阳区建国路88号SOHO现代城3号楼12层1201室' },
  { no: '2',  name: '王丽华',     id: '310104198807235678', cur: { code: 'CHF', num: '15' }, amount: '87654',  type: '5503', acct: '0322', term: '06', addr: '上海市徐汇区漕溪北路88号圣爱广场8楼802室' },
  { no: '3',  name: '李春燕',     id: '440103199202145678', cur: { code: 'RMB', num: '01' }, amount: '65432',  type: '5507', acct: '0423', term: '03', addr: '广东省广州市荔湾区上下九步行街45号恒宝广场5楼501室' },
  { no: '4',  name: '刘建军',     id: '210203199011235678', cur: { code: 'SEK', num: '21' }, amount: '234567', type: '5511', acct: '0533', term: '36', addr: '辽宁省大连市中山区人民路26号香格里拉大厦15层1506室' },
  { no: '5',  name: '陈桂芳',     id: '320104198809125678', cur: { code: 'DKK', num: '22' }, amount: '189012', type: '5513', acct: '0634', term: '18', addr: '江苏省南京市秦淮区太平南路1号金陵饭店11层1102室' },
  { no: '6',  name: '杨永强',     id: '330103199305145678', cur: { code: 'NOK', num: '23' }, amount: '276543', type: '5515', acct: '0735', term: '36', addr: '浙江省杭州市拱墅区莫干山路100号耀江国际大厦9层901室' },
  { no: '7',  name: '赵文斌',     id: '370202198606215678', cur: { code: 'JPY', num: '27' }, amount: '342109', type: '5517', acct: '0836', term: '12', addr: '山东省青岛市市南区香港中路12号丰合广场14层1403室' },
  { no: '8',  name: '黄淑芬',     id: '410105199401025678', cur: { code: 'AUD', num: '29' }, amount: '43152',  type: '5519', acct: '0937', term: '03', addr: '河南省郑州市二七区二七广场1号亚细亚商场6楼601室' },
  { no: '9',  name: '周国平',     id: '440106199010235678', cur: { code: 'EUR', num: '38' }, amount: '612345', type: '5521', acct: '1038', term: '18', addr: '广东省广州市天河区体育西路191号中石化大厦20层2005室' },
  { no: '10', name: '吴晓梅',     id: '510107199206145678', cur: { code: 'MOP', num: '81' }, amount: '159876', type: '5523', acct: '1139', term: '12', addr: '四川省成都市武侯区人民南路四段1号来福士广场7层702室' },
  { no: '11', name: '徐志刚',     id: '110108199011145678', cur: { code: 'PHP', num: '82' }, amount: '89765',  type: '5525', acct: '1240', term: '06', addr: '北京市海淀区苏州街3号大河庄园4号楼10层1001室' },
  { no: '12', name: '孙玉兰',     id: '350103199305145678', cur: { code: 'THB', num: '84' }, amount: '205432', type: '5527', acct: '1341', term: '36', addr: '福建省厦门市思明区中山路105号中华城3楼302室' },
  { no: '13', name: '马俊峰',     id: '440112199101025678', cur: { code: 'NZD', num: '87' }, amount: '245678', type: '5529', acct: '1442', term: '24', addr: '广东省广州市黄埔区科学城彩频路7号广东软件园D栋8层801室' },
  { no: '14', name: '朱秀英',     id: '330106199204145678', cur: { code: 'HKD', num: '13' }, amount: '152345', type: '5508', acct: '1522', term: '12', addr: '浙江省杭州市西湖区文二路391号西湖国际科技大厦12层1202室' },
  { no: '15', name: '胡建国',     id: '320102198808125678', cur: { code: 'GBP', num: '12' }, amount: '164567', type: '5502', acct: '1623', term: '06', addr: '江苏省南京市玄武区珠江路67号雄狮国际大厦6楼603室' },
  { no: '16', name: '郭春华',     id: '210102199311025678', cur: { code: 'CAD', num: '28' }, amount: '32109',  type: '5513', acct: '1728', term: '03', addr: '辽宁省沈阳市沈河区中街路168号中兴大厦5楼502室' },
  { no: '17', name: '林志远',     id: '350102198909145678', cur: { code: 'SGD', num: '18' }, amount: '194321', type: '5511', acct: '1818', term: '18', addr: '福建省福州市台江区江滨中大道378号海钻大厦16层1601室' },
  { no: '18', name: '何桂英',     id: '510104199206215678', cur: { code: 'USD', num: '14' }, amount: '87543',  type: '5501', acct: '1914', term: '12', addr: '四川省成都市锦江区东大街99号晶融汇10层1003室' },
  { no: '19', name: '高文杰',     id: '330104199311025678', cur: { code: 'EUR', num: '38' }, amount: '543210', type: '5521', acct: '2038', term: '36', addr: '浙江省杭州市江干区钱江新城新业路8号UDC时代大厦18层1802室' },
  { no: '20', name: '罗凤英',     id: '440111199005145678', cur: { code: 'RMB', num: '01' }, amount: '32109',  type: '5507', acct: '2101', term: '03', addr: '广东省广州市白云区白云大道北333号岭南新世界2栋9层902室' },
];

/* 第 3 套题库（20 条 mock） */
const BANK_3 = [
  { no: '1',  name: '陈志明',   id: '110101199204125678', cur: { code: 'THB', num: '84' }, amount: '187654', type: '5527', acct: '2284', term: '18', addr: '北京市东城区东直门外大街42号宇飞大厦8层801室' },
  { no: '2',  name: '李建国',     id: '620102198801025678', cur: { code: 'NZD', num: '87' }, amount: '234567', type: '5529', acct: '2387', term: '36', addr: '甘肃省兰州市城关区张掖路246号兰州中心12层1203室' },
  { no: '3',  name: '杜海燕',     id: '510105199310145678', cur: { code: 'PHP', num: '82' }, amount: '76543',  type: '5525', acct: '2482', term: '06', addr: '四川省成都市青羊区顺城大街289号富力中心7层702室' },
  { no: '4',  name: '白志强',   id: '610102198806215678', cur: { code: 'MOP', num: '81' }, amount: '158432', type: '5523', acct: '2581', term: '12', addr: '陕西省西安市新城区解放路77号民乐园万达广场6楼601室' },
  { no: '5',  name: '苏文华',     id: '320105199011235678', cur: { code: 'AUD', num: '29' }, amount: '45678',  type: '5519', acct: '2629', term: '03', addr: '江苏省南京市江宁区双龙大道1680号百家湖国际广场10层1005室' },
  { no: '6',  name: '辛晓东',   id: '330102199305145678', cur: { code: 'JPY', num: '27' }, amount: '365432', type: '5517', acct: '2727', term: '24', addr: '浙江省杭州市上城区解放东路38号钱江国际时代广场15层1501室' },
  { no: '7',  name: '李桂芝',   id: '370203199201025678', cur: { code: 'NOK', num: '23' }, amount: '198765', type: '5515', acct: '2823', term: '36', addr: '山东省青岛市市北区台东三路77号利群商厦5楼503室' },
  { no: '8',  name: '曹国庆',     id: '410102199004125678', cur: { code: 'DKK', num: '22' }, amount: '165432', type: '5513', acct: '2922', term: '18', addr: '河南省郑州市中原区建设西路39号王府井百货8楼802室' },
  { no: '9',  name: '刘家兴',     id: '510106198909145678', cur: { code: 'SEK', num: '21' }, amount: '254321', type: '5511', acct: '3021', term: '36', addr: '四川省成都市成华区双庆路8号华润万象城9层904室' },
  { no: '10', name: '孙德胜',     id: '320106199211025678', cur: { code: 'RMB', num: '01' }, amount: '43210',  type: '5507', acct: '3101', term: '03', addr: '江苏省南京市六合区雄州街道延安路15号苏宁易购广场4楼402室' },
  { no: '11', name: '关永康',     id: '110106199305145678', cur: { code: 'CHF', num: '15' }, amount: '98765',  type: '5503', acct: '3215', term: '06', addr: '北京市丰台区方庄芳古园一区18号楼6层601室' },
  { no: '12', name: '张国栋',     id: '120101198801025678', cur: { code: 'HKD', num: '13' }, amount: '167890', type: '5508', acct: '3313', term: '12', addr: '天津市和平区滨江道200号乐宾百货10层1002室' },
  { no: '13', name: '赵国庆',     id: '130102199012145678', cur: { code: 'GBP', num: '12' }, amount: '143210', type: '5502', acct: '3412', term: '06', addr: '河北省石家庄市长安区中山东路168号勒泰中心8楼801室' },
  { no: '14', name: '冯志刚',   id: '510107199210235678', cur: { code: 'CAD', num: '28' }, amount: '34567',  type: '5513', acct: '3528', term: '03', addr: '四川省成都市武侯区一环路南二段6号数码广场6楼601室' },
  { no: '15', name: '周丽萍',     id: '320102199106215678', cur: { code: 'SGD', num: '18' }, amount: '209876', type: '5511', acct: '3618', term: '18', addr: '江苏省南京市玄武区中央路258号红山森林动物园西门3层301室' },
  { no: '16', name: '陆建军',     id: '210203199305145678', cur: { code: 'EUR', num: '38' }, amount: '654321', type: '5521', acct: '3738', term: '36', addr: '辽宁省大连市西岗区中山路147号森茂大厦16层1603室' },
  { no: '17', name: '吕文博',     id: '350102199401025678', cur: { code: 'USD', num: '14' }, amount: '98765',  type: '5501', acct: '3814', term: '12', addr: '福建省福州市鼓楼区五四路158号环球广场7层701室' },
  { no: '18', name: '王雪梅',     id: '440103199311145678', cur: { code: 'NZD', num: '87' }, amount: '210987', type: '5529', acct: '3987', term: '24', addr: '广东省广州市荔湾区上下九路88号恒宝华庭5楼503室' },
  { no: '19', name: '乔秀珍',     id: '330104199205215678', cur: { code: 'AUD', num: '29' }, amount: '52134',  type: '5519', acct: '4029', term: '03', addr: '浙江省杭州市江干区庆春东路66号庆春银泰11层1102室' },
  { no: '20', name: '乔玉兰',     id: '310107199012145678', cur: { code: 'RMB', num: '01' }, amount: '12345',  type: '5507', acct: '4101', term: '03', addr: '上海市普陀区中山北路3300号环球港8楼802室' },
];

/* 题库注册表与当前题库 */
const QUESTION_BANKS = [BANK_1, BANK_2, BANK_3];
let currentBank = 0;
let PRELOADED = QUESTION_BANKS[currentBank];

function switchBank(idx) {
  if (idx === currentBank || idx < 0 || idx >= QUESTION_BANKS.length) return;
  currentBank = idx;
  PRELOADED = QUESTION_BANKS[idx];
  resetTraining(); // 新题库：重置计时、清空录入与统计
  render();        // 重渲染当前页（综合训练页）
}

/* ---------------- 倒计时（10 分钟训练计时：焦点驱动） ----------------
 * 焦点进入录入表 → 自动开始 / 继续计时；焦点移出录入表 → 自动暂停；
 * 归零 → 自动提交核对统计。重新训练可随时重置。
 */
const TIMER_SECONDS = 10 * 60;
const timer = { started: false, finished: false, running: false, remaining: TIMER_SECONDS, intervalId: null };

function fmtTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

/* ---------------- 工具函数 ---------------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const $ = (sel, root) => (root || document).querySelector(sel);

/* ---------------- 侧边栏 ---------------- */
function renderSidebar(activeId) {
  $('#sidebarNav').innerHTML = EXERCISES.map(ex => `
    <a class="nav-item${ex.id === activeId ? ' active' : ''}"
       href="#/${ex.id}" data-id="${ex.id}" title="${esc(ex.name)}">
      <span class="nav-icon">${esc(ex.icon)}</span>
      <span class="nav-label">${esc(ex.name)}</span>
    </a>`).join('');
}

function initSidebar() {
  $('#sidebarToggle').addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
    updateToggleIcon();
  });
  updateToggleIcon();
}

function updateToggleIcon() {
  const collapsed = document.body.classList.contains('sidebar-collapsed');
  $('#sidebarToggle').textContent = collapsed ? '»' : '«';
  $('#sidebarToggle').title = collapsed ? '展开侧边栏' : '收起侧边栏';
}

/* ---------------- 路由 ---------------- */
function getRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  return EXERCISES.some(ex => ex.id === h) ? h : 'train';
}

function render() {
  const activeId = getRoute();
  renderSidebar(activeId);
  const ex = EXERCISES.find(e => e.id === activeId);
  const main = $('#main');

  if (ex.placeholder) {
    main.innerHTML = renderPlaceholder(ex);
    main.querySelector('.btn-back')?.addEventListener('click', () => {
      location.hash = '#/train';
    });
  } else if (typeof ex.render === 'function') {
    main.innerHTML = ex.render();
    // 统一绑定「返回综合录入训练」按钮（占位页 / 开发中页等均可使用）
    main.querySelector('.btn-back')?.addEventListener('click', () => {
      location.hash = '#/train';
    });
    if (ex.afterRender) ex.afterRender();
  } else {
    main.innerHTML = renderPlaceholder({ name: ex.name });
  }
  main.scrollTop = 0;
}

/* ---------------- 版本号 ----------------
 * 约定：每次 git push 发布后，小版本 +0.0.1（如 1.0.2 → 1.0.3）
 */
const APP_VERSION = '1.0.2';
function pageFoot() {
  return `<div class="page-foot">国中行银综合录入训练 v${APP_VERSION} · 仅供教学训练使用</div>`;
}

/* ---------------- 中文训练页（开发中） ---------------- */
function renderChinesePage() {
  return `
    <div class="page-head">
      <h2>中文训练</h2>
      <p>当前位置：练习导航 › 中文训练</p>
    </div>
    <div class="placeholder">
      <div class="card">
        <div class="big">开</div>
        <h3>开发中</h3>
        <p>中文训练功能正在开发中，敬请期待。<br>完成后将在此页面展示训练内容。</p>
        <button type="button" class="btn btn-primary btn-back">返回综合录入训练</button>
      </div>
    </div>
    ${pageFoot()}`;
}

/* ---------------- 占位页（后期新练习） ---------------- */
function renderPlaceholder(ex) {
  return `
    <div class="page-head">
      <h2>${esc(ex.name)}</h2>
      <p>当前位置：练习导航 › ${esc(ex.name)}</p>
    </div>
    <div class="placeholder">
      <div class="card">
        <div class="big">＋</div>
        <h3>该练习页面尚未添加</h3>
        <p>此入口为后续扩展预留。<br>在 js/app.js 的 EXERCISES 列表中追加一项并实现 render 函数，即可挂载新的练习页面。</p>
        <button type="button" class="btn btn-primary btn-back">返回综合录入训练</button>
      </div>
    </div>
    ${pageFoot()}`;
}

/* ---------------- 综合录入训练页 ---------------- */
function renderTrainPage() {
  const head = COLUMNS.map(c => `<th>${c.label}</th>`).join('');
  // 两个表格共用同一列宽定义，保证上下对齐
  const colGroup = `<colgroup>${COLUMNS.map(c => `<col class="c-${c.key}">`).join('')}</colgroup>`;

  // 预录入信息表：币别列显示“字母代码 + 红色加粗数字编号”
  const preRows = PRELOADED.map(r => `
    <tr>
      ${COLUMNS.map(c => {
        let cell;
        if (c.key === 'cur') {
          cell = `<span class="cur-code">${esc(r.cur.code)}</span><b class="cur-num">${esc(r.cur.num)}</b>`;
        } else {
          cell = esc(r[c.key]);
        }
        return `<td class="${c.key === 'addr' ? 'col-addr' : ''}">${cell}</td>`;
      }).join('')}
    </tr>`).join('');

  // 录入表（空白输入框，币别列要求填写数字代码）
  const inputRows = PRELOADED.map((r, i) => `
    <tr data-row="${i}">
      <td class="row-no">${i + 1}</td>
      ${COLUMNS.slice(1).map(c => {
        const ph = c.key === 'addr' ? '请输入地址'
                 : c.key === 'cur' ? '数字代码，如 18'
                 : '';
        return `
        <td>
          <input type="text" data-col="${c.key}"
                 placeholder="${ph}"
                 autocomplete="off" spellcheck="false">
        </td>`;
      }).join('')}
    </tr>`).join('');

  return `
    <div class="page-head">
      <h2>综合录入训练</h2>
      <p>当前位置：练习导航 › 综合录入训练 &nbsp;|&nbsp; 上方为预录入信息，请在下方的空白表格中完成录入，10 分钟内提交核对。</p>
    </div>

    <section class="section">
      <div class="section-head">
        <h3>预录入信息</h3>
        <div class="head-tools">
          <div class="bank-group" id="bankGroup">
            <span class="bank-label">题库</span>
            ${QUESTION_BANKS.map((b, i) => `
              <button type="button" class="bank-btn${i === currentBank ? ' active' : ''}" data-bank="${i}">第 ${i + 1} 套</button>`).join('')}
          </div>
          <span class="hint">共 ${PRELOADED.length} 条 · 框内可滚动查看 · 币别栏红色数字为编号，录入时填写该编号</span>
        </div>
      </div>
      <div class="section-body table-wrap box-pre">
        <table class="data-table pre-table">
          ${colGroup}
          <thead><tr>${head}</tr></thead>
          <tbody>${preRows}</tbody>
        </table>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h3>录入区</h3>
        <div class="timer">
          <span class="timer-label">倒计时</span>
          <span class="timer-value" id="timerValue">${fmtTime(timer.remaining)}</span>
          <span class="timer-state" id="timerState">${!timer.started ? '未开始' : timer.running ? '进行中' : timer.finished ? '已结束' : '已暂停'}</span>
        </div>
      </div>
      <div class="section-body">
        <div class="table-wrap box-input">
          <table class="data-table input-table">
            ${colGroup}
            <thead><tr>${head}</tr></thead>
            <tbody>${inputRows}</tbody>
          </table>
        </div>
        <p class="focus-hint">💡 将光标移入录入表格即自动开始计时，焦点移出表格自动暂停；时间归零自动提交核对。</p>
        <div class="actions">
          <button type="button" class="btn btn-primary" id="btnResetAll">重新训练</button>
          <button type="button" class="btn btn-outline" id="btnSubmit">提交核对</button>
          <button type="button" class="btn btn-ghost" id="btnReset">重置录入</button>
        </div>
        <div class="check-result" id="checkResult"></div>
      </div>
    </section>

    ${pageFoot()}`;
}

/* ---------------- 倒计时控制（焦点驱动） ---------------- */
function updateTimerUI() {
  const v = $('#timerValue');
  if (v) {
    v.textContent = fmtTime(timer.remaining);
    v.classList.toggle('danger', timer.running && timer.remaining <= 60);
  }
  const st = $('#timerState');
  if (st) {
    st.textContent = !timer.started ? '未开始'
      : timer.running ? '进行中'
      : timer.finished ? '已结束'
      : '已暂停';
  }
}

function resumeTraining() {
  if (timer.finished || timer.running) return;
  timer.started = true;
  timer.running = true;
  timer.intervalId = setInterval(() => {
    timer.remaining = Math.max(0, timer.remaining - 1);
    updateTimerUI();
    if (timer.remaining === 0) {
      stopTimer();
      timer.finished = true;
      submitCheck(true); // 时间到，自动统计
    }
  }, 1000);
  updateTimerUI();
}

function pauseTraining() {
  if (!timer.running) return;
  stopTimer();
  updateTimerUI();
}

function resetTraining() {
  stopTimer();
  timer.remaining = TIMER_SECONDS;
  timer.started = false;
  timer.finished = false;
  resetInputs();
  updateTimerUI();
}

function stopTimer() {
  if (timer.intervalId) { clearInterval(timer.intervalId); timer.intervalId = null; }
  timer.running = false;
}

/* ---------------- 提交核对：格式校验 + 与预录入信息逐格比对 + 准确率统计 ---------------- */
function submitCheck(auto) {
  const result = $('#checkResult');
  if (!timer.started) {
    result.innerHTML = `<div class="bar warn">⏱ 请先将光标移入录入表格（将自动开始计时）再提交核对</div>`;
    return;
  }

  const rows = Array.from(document.querySelectorAll('.input-table tbody tr'));
  const errors = [];   // 格式错误明细
  const diffs = [];    // 与预录不一致明细
  let correctRows = 0;

  rows.forEach((tr, i) => {
    const row = PRELOADED[i];
    let rowOk = true;
    Array.from(tr.querySelectorAll('input')).forEach(inp => {
      inp.classList.remove('error');
      const col = inp.dataset.col;
      const val = inp.value.trim();
      const label = COLUMNS.find(c => c.key === col).label;

      // —— 格式校验 ——
      let msg = null;
      if (!val) {
        // 空字段：标红框、该行计错，但不在明细中罗列“不能为空”（避免大片空白时刷屏）
        inp.classList.add('error');
        rowOk = false;
        return;
      }
      if (col === 'id' && !/^\d{17}[\dXx]$/.test(val)) {
        msg = `第 ${i + 1} 行身份证号格式不正确（应为 18 位）`;
      } else if (col === 'amount' && !/^\d+$/.test(val)) {
        msg = `第 ${i + 1} 行金额必须为数字`;
      } else if (col === 'cur') {
        if (!/^\d{2}$/.test(val)) {
          msg = `第 ${i + 1} 行「币别」应填写 2 位数字编号（如 18）`;
        } else if (!CURRENCY_BY_NUM.has(val)) {
          msg = `第 ${i + 1} 行「币别」编号不存在，请参考预录入信息中的红色编号`;
        }
      } else if ((col === 'type' || col === 'acct' || col === 'term') && !/^\d+$/.test(val)) {
        msg = `第 ${i + 1} 行「${label}」必须为数字`;
      }

      if (msg) {
        inp.classList.add('error');
        errors.push(msg);
        rowOk = false;
        return;
      }

      // —— 与预录入信息逐格核对 ——
      const expect = col === 'cur' ? row.cur.num : row[col];
      if (val !== String(expect)) {
        inp.classList.add('error');
        diffs.push(`第 ${i + 1} 行「${label}」录入为「${esc(val)}」，预录入信息为「${esc(expect)}」`);
        rowOk = false;
      }
    });

    if (rowOk) correctRows++;
  });

  // —— 准确率统计 ——
  const total = rows.length;
  const wrongRows = total - correctRows;
  const pct = (correctRows / total * 100).toFixed(1);
  const head = `${auto ? '⏱ 时间到，已自动统计：' : '📊 核对结果：'}共 ${total} 条 · 正确 ${correctRows} 条 · 错误 ${wrongRows} 条 · 准确率 ${pct}%`;

  if (wrongRows === 0) {
    result.innerHTML = `<div class="bar ok">${head}</div>`;
    return;
  }

  const details = errors.concat(diffs);
  result.innerHTML = `
    <div class="bar warn">
      ${head}
      <button type="button" class="btn btn-ghost" id="btnFix">一键定位</button>
    </div>
    <ul>${details.map(d => `<li>${d}</li>`).join('')}</ul>`;
  $('#btnFix').addEventListener('click', () => {
    document.querySelector('.input-table input.error')?.focus();
  });
}

function resetInputs() {
  document.querySelectorAll('.input-table input').forEach(inp => {
    inp.value = '';
    inp.classList.remove('error');
  });
  const result = $('#checkResult');
  if (result) result.innerHTML = '';
}

/* ---------------- 滚动幅度控制：表格框内滚轮滚动幅度缩小 1/3（× 2/3） ---------------- */
function tameTableScroll() {
  document.querySelectorAll('.table-wrap').forEach(container => {
    container.addEventListener('wheel', e => {
      const canV = container.scrollHeight > container.clientHeight;
      const canH = container.scrollWidth > container.clientWidth;
      if (!canV && !canH) return; // 无可滚动内容时不拦截，避免吞掉页面滚动
      e.preventDefault();
      container.scrollTop += e.deltaY * (2 / 3);
      container.scrollLeft += e.deltaX * (2 / 3);
    }, { passive: false });
  });
}

/* ---------------- 录入表内换格：Enter / Tab 都同行下一格，行末切下一行首格 ----------------
 * Tab 前进用显式实现（含行末跳转、最后一行行末停在原地，不跳出表格）；
 * Shift+Tab 反向仍走浏览器原生。中文输入法组词时的 Enter（isComposing）不触发换格。
 */
function bindEnterNavigation() {
  document.querySelectorAll('.input-table tbody input').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.isComposing || e.keyCode === 229) return;
      const isEnter = e.key === 'Enter';
      const isTab = e.key === 'Tab' && !e.shiftKey;
      if (!isEnter && !isTab) return;
      e.preventDefault();
      const inputs = Array.from(document.querySelectorAll('.input-table tbody input'));
      const idx = inputs.indexOf(e.target);
      if (idx === -1 || idx === inputs.length - 1) return; // 最后一行行末：停在原地
      inputs[idx + 1].focus();
    });
  });
}

function initTrainPage() {
  $('#btnResetAll').addEventListener('click', resetTraining);
  $('#btnSubmit').addEventListener('click', () => submitCheck(false));
  $('#btnReset').addEventListener('click', resetInputs);

  // 题库切换：点击后切换当前题库并重置训练
  document.querySelectorAll('.bank-btn').forEach(btn => {
    btn.addEventListener('click', () => switchBank(Number(btn.dataset.bank)));
  });

  // 滚动幅度缩小 1/3
  tameTableScroll();

  // Enter 键在录入表内换格（同行下一格 / 行末下一行首格）
  bindEnterNavigation();

  // 焦点进入录入表 → 自动开始 / 继续计时；焦点移出录入表 → 自动暂停
  const box = $('.box-input');
  box.addEventListener('focusin', resumeTraining);
  box.addEventListener('focusout', () => {
    setTimeout(() => {
      if (!box.contains(document.activeElement)) pauseTraining();
    }, 0);
  });

  updateTimerUI();
}

/* ---------------- 启动（幂等：防止 DOMContentLoaded 重复触发导致重复初始化） ---------------- */
let booted = false;
document.addEventListener('DOMContentLoaded', () => {
  if (booted) return;
  booted = true;
  // 侧边栏始终完整显示（不随窗口宽度自动收起）；如需收起可手动点击左上角按钮
  initSidebar();
  window.addEventListener('hashchange', render);
  render();
});
