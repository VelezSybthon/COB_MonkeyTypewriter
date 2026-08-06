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
  { key: 'id1',    label: '编号 1' },
  { key: 'cur',    label: '币种代码' },
  { key: 'd1',     label: '数字段 1' },
  { key: 'd2',     label: '数字段 2' },
  { key: 'd3',     label: '数字段 3' },
  { key: 'd4',     label: '数字段 4' },
  { key: 'addr',   label: '地址' },
];

const BANK_1 = [
  { no: '1',  name: '龙星通',   id1: '450105213602134603', cur: { code: 'DKK', num: '22' }, d1: '987357', d2: '5515', d3: '0475', d4: '06', addr: '河南省郑州市金水区横滨大道国贸中心2F2808室' },
  { no: '2',  name: '戴向晚',   id1: '630105201407053456', cur: { code: 'SGD', num: '18' }, d1: '555544', d2: '5515', d3: '0183', d4: '03', addr: '天津市和平劝业场街道和平路200号劝业场旁丰路小区3号楼1单元502室' },
  { no: '3',  name: '申博航',   id1: '440312199103151280', cur: { code: 'HKD', num: '13' }, d1: '984633', d2: '5515', d3: '0183', d4: '03', addr: '北京市昌平区沙河高教园北二街8号北街家园15号楼3单元401室' },
  { no: '4',  name: '诸葛星',   id1: '230103201703197911', cur: { code: 'CHF', num: '15' }, d1: '89786', d2: '5531', d3: '0475', d4: '06', addr: '广东省中山市东区中山四路88号盛景尚峰商务中心22层2205室' },
  { no: '5',  name: '曲泰华',   id1: '430104199801051290', cur: { code: 'AUD', num: '29' }, d1: '262837', d2: '7002', d3: '0059', d4: '60', addr: '河北省遵化市遵化镇华明南路189号遵化政务玫瑰园小区9号楼3单元603室' },
  { no: '6',  name: '童龚琴',   id1: '350104206503217995', cur: { code: 'JPY', num: '27' }, d1: '153474', d2: '5510', d3: '1018', d4: '36', addr: '江苏省常州市新北区晋陵北路217号常发广场25层2506室' },
  { no: '7',  name: '申张杨',   id1: '530103200206259089', cur: { code: 'THB', num: '84' }, d1: '555535', d2: '5502', d3: '0023', d4: '12', addr: '四川省宜宾市翠屏区中山街152号叙府商城写字楼13层1305室' },
  { no: '8',  name: '刘承风',   id1: '120103201201059034', cur: { code: 'PHP', num: '82' }, d1: '12645', d2: '5515', d3: '0183', d4: '03', addr: '重庆市江北区观音桥步行街9号北城天街35层3506室' },
  { no: '9',  name: '侯锦矸',   id1: '110110198610121303', cur: { code: 'SEK', num: '21' }, d1: '235760', d2: '5515', d3: '0179', d4: '18', addr: '广东省深圳市宝安区宝安大道5015号海雅缤纷城22层2209室' },
  { no: '10',  name: '苏禾佳',   id1: '440105212604281303', cur: { code: 'NZD', num: '87' }, d1: '987355', d2: '5502', d3: '0720', d4: '12', addr: '上海市虹口区四川北路1688号嘉杰国际广场16层1603室' },
  { no: '11',  name: '赵心忠',   id1: '410101201012255667', cur: { code: 'HKD', num: '13' }, d1: '262832', d2: '5515', d3: '0475', d4: '06', addr: '河北省廊坊市安次区光明西道128号廊坊师范学院旁瑞景嘉园小区6号楼2单元701室' },
  { no: '12',  name: '耿果御',   id1: '620104200801051290', cur: { code: 'NZD', num: '87' }, d1: '555538', d2: '5524', d3: '0055', d4: '18', addr: '天津市宝坻区宝平街道开元路128号宝境新城9号楼2单元601室' },
  { no: '13',  name: '关澳莱',   id1: '530101217707191311', cur: { code: 'RMB', num: '01' }, d1: '118654', d2: '5502', d3: '0023', d4: '12', addr: '江苏省苏州市姑苏区观前街1号美罗商城18层1803室' },
  { no: '14',  name: '程清和',   id1: '620102200611157878', cur: { code: 'THB', num: '84' }, d1: '555546', d2: '7002', d3: '0623', d4: '60', addr: '天津市河北区光复道街道海河东路123号意式风情区旁君临天下小区11号楼4单元1001室' },
  { no: '15',  name: '单齐吻',   id1: '3701041993066251245', cur: { code: 'USD', num: '14' }, d1: '241633', d2: '5515', d3: '0475', d4: '06', addr: '四川省德阳市广汉市中山大道南四段1号天阶汇广场16层1605室' },
  { no: '16',  name: '韩北辞',   id1: '340109206010091345', cur: { code: 'JPY', num: '27' }, d1: '153473', d2: '5515', d3: '0183', d4: '03', addr: '黑龙江省齐齐哈尔市建华区中华路158号鑫海家园北区X座13层1307室' },
  { no: '17',  name: '申津南',   id1: '610103200709259034', cur: { code: 'SGD', num: '18' }, d1: '665551', d2: '5515', d3: '0183', d4: '03', addr: '安徽省淮南市田家庵区洞山中路42号淮南新世界广场写字楼A座14层1402室' },
  { no: '18',  name: '舒知肘',   id1: '150105200403157979', cur: { code: 'USD', num: '14' }, d1: '118660', d2: '5502', d3: '0023', d4: '24', addr: '湖北省武汉市江汉区解放大道688号武汉国际广场W座32层3206室' },
  { no: '19',  name: '焦怡苒',   id1: '150104197802084661', cur: { code: 'NOK', num: '23' }, d1: '114700', d2: '5511', d3: '0623', d4: '36', addr: '江苏省扬州市广陵区昌中路492号珍园商业广场12层1209室' },
  { no: '20',  name: '钱知予',   id1: '140101200109047911', cur: { code: 'HKD', num: '13' }, d1: '11469', d2: '5513', d3: '0059', d4: '60', addr: '广西壮族自治区北海市安海顺路83号智享中心综合大厅4号' },
  { no: '21',  name: '韩清和',   id1: '230107202107161353', cur: { code: 'SEK', num: '21' }, d1: '32500', d2: '5515', d3: '0183', d4: '03', addr: '四川省乐山市峨眉山市名山东路46号峨眉山国际大酒店写字楼16层1605室' },
  { no: '22',  name: '樊星冰',   id1: '320512200107159024', cur: { code: 'PHP', num: '82' }, d1: '87661', d2: '5502', d3: '0023', d4: '24', addr: '贵州省黔西南兴义桔山大道18号兴义梦乐城A座19层1905门' },
  { no: '23',  name: '尤清禾',   id1: '330107204911174637', cur: { code: 'GBP', num: '12' }, d1: '31579', d2: '5516', d3: '0055', d4: '24', addr: '江西省九江市濂溪区十里街道前进东路888号九江新天地I座16层1602室' },
  { no: '24',  name: '邢定贤',   id1: '11010119901054312', cur: { code: 'CHF', num: '15' }, d1: '241635', d2: '5522', d3: '0055', d4: '18', addr: '广西壮族自治区南宁市青秀区民族大道Xing星埌大厦X座19层1905号' },
  { no: '25',  name: '廖黎锋',   id1: '320103203509067995', cur: { code: 'JPY', num: '27' }, d1: '153468', d2: '7002', d3: '0059', d4: '60', addr: '广西壮族自治区玉林市玉州区人民东路733号玉林南城百货Y座12层1202室' },
  { no: '26',  name: '高景川',   id1: '350106206705044611', cur: { code: 'EUR', num: '38' }, d1: '89787', d2: '5518', d3: '0055', d4: '18', addr: '北京市丰台区马家堡街道马家堡东路106号蓝光华海悦城5号楼4单元301室' },
  { no: '27',  name: '于润冉',   id1: '360109208006097945', cur: { code: 'JPY', num: '27' }, d1: '153477', d2: '7002', d3: '0059', d4: '60', addr: '湖南省衡阳市蒸湘区解放大道21号衡阳步步高H座16层1606室' },
  { no: '28',  name: '米滨族',   id1: '500104215004241345', cur: { code: 'GBP', num: '12' }, d1: '235753', d2: '5532', d3: '0475', d4: '06', addr: '河南省永城市栗园街道1492号2幢' },
  { no: '29',  name: '纪清越',   id1: '210104199310051245', cur: { code: 'DKK', num: '22' }, d1: '987626', d2: '5506', d3: '1002', d4: '24', addr: '河南省驻马店市驿城区乐山大道与置地大道交叉口驻马店丹尼斯二期Z座15层1505门' },
  { no: '30',  name: '卫安华',   id1: '110108199708159089', cur: { code: 'SGD', num: '18' }, d1: '12643', d2: '5502', d3: '0023', d4: '24', addr: '四川省攀枝花市东区炳草岗大街88号攀枝花花园二期D座15层1502号' },
  { no: '31',  name: '纪邹殷',   id1: '500102214802104629', cur: { code: 'NOK', num: '23' }, d1: '782478', d2: '5511', d3: '1018', d4: '36', addr: '山西省太原市杏花岭区府西街69号国贸中心写字楼A座12层1205室' },
  { no: '32',  name: '单烛白',   id1: '2102021996011057878', cur: { code: 'CHF', num: '15' }, d1: '665565', d2: '5515', d3: '0475', d4: '06', addr: '上海市静安区宝贡贞街178号静安新城8号楼4单元703室' },
  { no: '33',  name: '耿柔熙',   id1: '320511200006257813', cur: { code: 'HKD', num: '13' }, d1: '665563', d2: '5513', d3: '0183', d4: '03', addr: '北京市通州区新华大街60号天时名苑5号楼3单元1202室' },
  { no: '34',  name: '戚斌周',   id1: '460105214612287903', cur: { code: 'NZD', num: '87' }, d1: '246431', d2: '5511', d3: '1018', d4: '36', addr: '吉林省长春市朝阳区硅谷大街1888号吉大科技园I座25层2507室' },
  { no: '35',  name: '董景然',   id1: '2301062020066097945', cur: { code: 'SGD', num: '18' }, d1: '187946', d2: '5511', d3: '1018', d4: '36', addr: '河北省衡水市桃城区前进南大街88号衡水国际商务中心H座16层1605室' },
  { no: '36',  name: '柏母桥',   id1: '320110204204231361', cur: { code: 'CHF', num: '15' }, d1: '897872', d2: '5506', d3: '1002', d4: '24', addr: '广东省东莞市南城区鸿福路200号第一国际财富中心13层1306室' },
  { no: '37',  name: '单希辞',   id1: '3702031997100059089', cur: { code: 'PHP', num: '82' }, d1: '555543', d2: '5506', d3: '1006', d4: '24', addr: '黑龙江省绥化市北林区中兴大街156号福乾花园二期F座11层1102号' },
  { no: '38',  name: '马新遥',   id1: '3601032012033259034', cur: { code: 'DKK', num: '22' }, d1: '987623', d2: '5502', d3: '0023', d4: '24', addr: '江西省延津市何斋道2162号6楼' },
  { no: '39',  name: '袁晚舟',   id1: '410103201202159089', cur: { code: 'MOP', num: '81' }, d1: '984611', d2: '5511', d3: '1018', d4: '36', addr: '浙江省宁波市鄞州区宁穿路1888号Sky写字楼S座27层2702门' },
  { no: '40',  name: '上官夏',   id1: '450109214006097945', cur: { code: 'GBP', num: '12' }, d1: '235751', d2: '5513', d3: '0059', d4: '60', addr: '山东省日照市东港区泌扦膳道21号润象写字楼A座20层2003室' },
  { no: '41',  name: '关枫酚',   id1: '2101012006071791311', cur: { code: 'HKD', num: '13' }, d1: '11471', d2: '5502', d3: '0023', d4: '12', addr: '湖北省黄冈市黄州区赤壁大道88号黄冈遗爱湖公园旁商务楼B座12层1203室' },
  { no: '42',  name: '卞韧朗',   id1: '310105202701031311', cur: { code: 'MOP', num: '81' }, d1: '897869', d2: '5506', d3: '1002', d4: '24', addr: '山西省太原市杏花岭区乾溪弄69号山贸国际18层1809室' },
  { no: '43',  name: '东方眠',   id1: '120105201403253456', cur: { code: 'CHF', num: '15' }, d1: '21358', d2: '7002', d3: '0623', d4: '36', addr: '浙江省嘉兴市秀洲区中山西路1588号江南摩尔商业中心22层2206室' },
  { no: '44',  name: '单于晴',   id1: '510110216608284603', cur: { code: 'NZD', num: '87' }, d1: '246435', d2: '5510', d3: '1002', d4: '24', addr: '北京市昌平区沙河街道沙河高教园北三街8号北街家园5号楼3单元402室' },
  { no: '45',  name: '兮晟和',   id1: '3101122001111153446', cur: { code: 'SGD', num: '18' }, d1: '246448', d2: '5528', d3: '0055', d4: '18', addr: '北京市丰台区丰福明路智文国际教研中心校区三层3099' },
  { no: '46',  name: '公孙和',   id1: '1101081987088294587', cur: { code: 'MOP', num: '81' }, d1: '24868', d2: '5511', d3: '1018', d4: '36', addr: '北京市平谷区府前西街18号平谷银座大厦P座12层1202室' },
  { no: '47',  name: '裴鹿园',   id1: '340109206010091345', cur: { code: 'JPY', num: '27' }, d1: '153473', d2: '5515', d3: '0183', d4: '03', addr: '北京市石景山区石景山路29号首钢园六工汇8号楼3单元704室' },
  { no: '48',  name: '马丞晏',   id1: '330102200606257823', cur: { code: 'EUR', num: '38' }, d1: '262835', d2: '5502', d3: '0023', d4: '12', addr: '上海市浦东新区世纪大道1号上海环球金融中心58层5802室' },
  { no: '49',  name: '殷清晏',   id1: '3301022044066147987', cur: { code: 'THB', num: '84' }, d1: '54813', d2: '5515', d3: '0183', d4: '03', addr: '福建省厦门市湖里区环岛东路1699号建发国际大厦38层3808室' },
  { no: '50',  name: '濮逊美',   id1: '5101032002033259034', cur: { code: 'NOK', num: '23' }, d1: '785143', d2: '5506', d3: '0023', d4: '24', addr: '上海市黄浦区南京东路350号恒基名人商业大厦二期H座29层2903号' },
];

/* 第 2 套题库（20 条 mock） */
const BANK_2 = [
  { no: '1',  name: '张海涛',     id1: '110105198503124567', cur: { code: 'USD', num: '14' }, d1: '123456', d2: '5501', d3: '0211', d4: '12', addr: '北京市朝阳区建国路88号SOHO现代城3号楼12层1201室' },
  { no: '2',  name: '王丽华',     id1: '310104198807235678', cur: { code: 'CHF', num: '15' }, d1: '87654',  d2: '5503', d3: '0322', d4: '06', addr: '上海市徐汇区漕溪北路88号圣爱广场8楼802室' },
  { no: '3',  name: '李春燕',     id1: '440103199202145678', cur: { code: 'RMB', num: '01' }, d1: '65432',  d2: '5507', d3: '0423', d4: '03', addr: '广东省广州市荔湾区上下九步行街45号恒宝广场5楼501室' },
  { no: '4',  name: '刘建军',     id1: '210203199011235678', cur: { code: 'SEK', num: '21' }, d1: '234567', d2: '5511', d3: '0533', d4: '36', addr: '辽宁省大连市中山区人民路26号香格里拉大厦15层1506室' },
  { no: '5',  name: '陈桂芳',     id1: '320104198809125678', cur: { code: 'DKK', num: '22' }, d1: '189012', d2: '5513', d3: '0634', d4: '18', addr: '江苏省南京市秦淮区太平南路1号金陵饭店11层1102室' },
  { no: '6',  name: '杨永强',     id1: '330103199305145678', cur: { code: 'NOK', num: '23' }, d1: '276543', d2: '5515', d3: '0735', d4: '36', addr: '浙江省杭州市拱墅区莫干山路100号耀江国际大厦9层901室' },
  { no: '7',  name: '赵文斌',     id1: '370202198606215678', cur: { code: 'JPY', num: '27' }, d1: '342109', d2: '5517', d3: '0836', d4: '12', addr: '山东省青岛市市南区香港中路12号丰合广场14层1403室' },
  { no: '8',  name: '黄淑芬',     id1: '410105199401025678', cur: { code: 'AUD', num: '29' }, d1: '43152',  d2: '5519', d3: '0937', d4: '03', addr: '河南省郑州市二七区二七广场1号亚细亚商场6楼601室' },
  { no: '9',  name: '周国平',     id1: '440106199010235678', cur: { code: 'EUR', num: '38' }, d1: '612345', d2: '5521', d3: '1038', d4: '18', addr: '广东省广州市天河区体育西路191号中石化大厦20层2005室' },
  { no: '10', name: '吴晓梅',     id1: '510107199206145678', cur: { code: 'MOP', num: '81' }, d1: '159876', d2: '5523', d3: '1139', d4: '12', addr: '四川省成都市武侯区人民南路四段1号来福士广场7层702室' },
  { no: '11', name: '徐志刚',     id1: '110108199011145678', cur: { code: 'PHP', num: '82' }, d1: '89765',  d2: '5525', d3: '1240', d4: '06', addr: '北京市海淀区苏州街3号大河庄园4号楼10层1001室' },
  { no: '12', name: '孙玉兰',     id1: '350103199305145678', cur: { code: 'THB', num: '84' }, d1: '205432', d2: '5527', d3: '1341', d4: '36', addr: '福建省厦门市思明区中山路105号中华城3楼302室' },
  { no: '13', name: '马俊峰',     id1: '440112199101025678', cur: { code: 'NZD', num: '87' }, d1: '245678', d2: '5529', d3: '1442', d4: '24', addr: '广东省广州市黄埔区科学城彩频路7号广东软件园D栋8层801室' },
  { no: '14', name: '朱秀英',     id1: '330106199204145678', cur: { code: 'HKD', num: '13' }, d1: '152345', d2: '5508', d3: '1522', d4: '12', addr: '浙江省杭州市西湖区文二路391号西湖国际科技大厦12层1202室' },
  { no: '15', name: '胡建国',     id1: '320102198808125678', cur: { code: 'GBP', num: '12' }, d1: '164567', d2: '5502', d3: '1623', d4: '06', addr: '江苏省南京市玄武区珠江路67号雄狮国际大厦6楼603室' },
  { no: '16', name: '郭春华',     id1: '210102199311025678', cur: { code: 'CAD', num: '28' }, d1: '32109',  d2: '5513', d3: '1728', d4: '03', addr: '辽宁省沈阳市沈河区中街路168号中兴大厦5楼502室' },
  { no: '17', name: '林志远',     id1: '350102198909145678', cur: { code: 'SGD', num: '18' }, d1: '194321', d2: '5511', d3: '1818', d4: '18', addr: '福建省福州市台江区江滨中大道378号海钻大厦16层1601室' },
  { no: '18', name: '何桂英',     id1: '510104199206215678', cur: { code: 'USD', num: '14' }, d1: '87543',  d2: '5501', d3: '1914', d4: '12', addr: '四川省成都市锦江区东大街99号晶融汇10层1003室' },
  { no: '19', name: '高文杰',     id1: '330104199311025678', cur: { code: 'EUR', num: '38' }, d1: '543210', d2: '5521', d3: '2038', d4: '36', addr: '浙江省杭州市江干区钱江新城新业路8号UDC时代大厦18层1802室' },
  { no: '20', name: '罗凤英',     id1: '440111199005145678', cur: { code: 'RMB', num: '01' }, d1: '32109',  d2: '5507', d3: '2101', d4: '03', addr: '广东省广州市白云区白云大道北333号岭南新世界2栋9层902室' },
];

/* 第 3 套题库（20 条 mock） */
const BANK_3 = [
  { no: '1',  name: '陈志明',   id1: '110101199204125678', cur: { code: 'THB', num: '84' }, d1: '187654', d2: '5527', d3: '2284', d4: '18', addr: '北京市东城区东直门外大街42号宇飞大厦8层801室' },
  { no: '2',  name: '李建国',     id1: '620102198801025678', cur: { code: 'NZD', num: '87' }, d1: '234567', d2: '5529', d3: '2387', d4: '36', addr: '甘肃省兰州市城关区张掖路246号兰州中心12层1203室' },
  { no: '3',  name: '杜海燕',     id1: '510105199310145678', cur: { code: 'PHP', num: '82' }, d1: '76543',  d2: '5525', d3: '2482', d4: '06', addr: '四川省成都市青羊区顺城大街289号富力中心7层702室' },
  { no: '4',  name: '白志强',   id1: '610102198806215678', cur: { code: 'MOP', num: '81' }, d1: '158432', d2: '5523', d3: '2581', d4: '12', addr: '陕西省西安市新城区解放路77号民乐园万达广场6楼601室' },
  { no: '5',  name: '苏文华',     id1: '320105199011235678', cur: { code: 'AUD', num: '29' }, d1: '45678',  d2: '5519', d3: '2629', d4: '03', addr: '江苏省南京市江宁区双龙大道1680号百家湖国际广场10层1005室' },
  { no: '6',  name: '辛晓东',   id1: '330102199305145678', cur: { code: 'JPY', num: '27' }, d1: '365432', d2: '5517', d3: '2727', d4: '24', addr: '浙江省杭州市上城区解放东路38号钱江国际时代广场15层1501室' },
  { no: '7',  name: '李桂芝',   id1: '370203199201025678', cur: { code: 'NOK', num: '23' }, d1: '198765', d2: '5515', d3: '2823', d4: '36', addr: '山东省青岛市市北区台东三路77号利群商厦5楼503室' },
  { no: '8',  name: '曹国庆',     id1: '410102199004125678', cur: { code: 'DKK', num: '22' }, d1: '165432', d2: '5513', d3: '2922', d4: '18', addr: '河南省郑州市中原区建设西路39号王府井百货8楼802室' },
  { no: '9',  name: '刘家兴',     id1: '510106198909145678', cur: { code: 'SEK', num: '21' }, d1: '254321', d2: '5511', d3: '3021', d4: '36', addr: '四川省成都市成华区双庆路8号华润万象城9层904室' },
  { no: '10', name: '孙德胜',     id1: '320106199211025678', cur: { code: 'RMB', num: '01' }, d1: '43210',  d2: '5507', d3: '3101', d4: '03', addr: '江苏省南京市六合区雄州街道延安路15号苏宁易购广场4楼402室' },
  { no: '11', name: '关永康',     id1: '110106199305145678', cur: { code: 'CHF', num: '15' }, d1: '98765',  d2: '5503', d3: '3215', d4: '06', addr: '北京市丰台区方庄芳古园一区18号楼6层601室' },
  { no: '12', name: '张国栋',     id1: '120101198801025678', cur: { code: 'HKD', num: '13' }, d1: '167890', d2: '5508', d3: '3313', d4: '12', addr: '天津市和平区滨江道200号乐宾百货10层1002室' },
  { no: '13', name: '赵国庆',     id1: '130102199012145678', cur: { code: 'GBP', num: '12' }, d1: '143210', d2: '5502', d3: '3412', d4: '06', addr: '河北省石家庄市长安区中山东路168号勒泰中心8楼801室' },
  { no: '14', name: '冯志刚',   id1: '510107199210235678', cur: { code: 'CAD', num: '28' }, d1: '34567',  d2: '5513', d3: '3528', d4: '03', addr: '四川省成都市武侯区一环路南二段6号数码广场6楼601室' },
  { no: '15', name: '周丽萍',     id1: '320102199106215678', cur: { code: 'SGD', num: '18' }, d1: '209876', d2: '5511', d3: '3618', d4: '18', addr: '江苏省南京市玄武区中央路258号红山森林动物园西门3层301室' },
  { no: '16', name: '陆建军',     id1: '210203199305145678', cur: { code: 'EUR', num: '38' }, d1: '654321', d2: '5521', d3: '3738', d4: '36', addr: '辽宁省大连市西岗区中山路147号森茂大厦16层1603室' },
  { no: '17', name: '吕文博',     id1: '350102199401025678', cur: { code: 'USD', num: '14' }, d1: '98765',  d2: '5501', d3: '3814', d4: '12', addr: '福建省福州市鼓楼区五四路158号环球广场7层701室' },
  { no: '18', name: '王雪梅',     id1: '440103199311145678', cur: { code: 'NZD', num: '87' }, d1: '210987', d2: '5529', d3: '3987', d4: '24', addr: '广东省广州市荔湾区上下九路88号恒宝华庭5楼503室' },
  { no: '19', name: '乔秀珍',     id1: '330104199205215678', cur: { code: 'AUD', num: '29' }, d1: '52134',  d2: '5519', d3: '4029', d4: '03', addr: '浙江省杭州市江干区庆春东路66号庆春银泰11层1102室' },
  { no: '20', name: '乔玉兰',     id1: '310107199012145678', cur: { code: 'RMB', num: '01' }, d1: '12345',  d2: '5507', d3: '4101', d4: '03', addr: '上海市普陀区中山北路3300号环球港8楼802室' },
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
const APP_VERSION = '1.0.6';
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
          <span class="hint">共 ${PRELOADED.length} 条 · 框内可滚动查看 · 币种代码栏红色数字为编号，录入时填写该编号</span>
        </div>
      </div>
      <div class="section-body">
        <div class="table-wrap box-pre">
          <table class="data-table pre-table">
            ${colGroup}
            <thead><tr>${head}</tr></thead>
            <tbody>${preRows}</tbody>
          </table>
        </div>
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
      if (col === 'id1' && !/^\d+$/.test(val)) {
        msg = `第 ${i + 1} 行「编号 1」必须为数字`;
      } else if (col === 'd1' && !/^\d+$/.test(val)) {
        msg = `第 ${i + 1} 行「数字段 1」必须为数字`;
      } else if (col === 'cur') {
        if (!/^\d{2}$/.test(val)) {
          msg = `第 ${i + 1} 行「币种代码」应填写 2 位数字编号（如 18）`;
        } else if (!CURRENCY_BY_NUM.has(val)) {
          msg = `第 ${i + 1} 行「币种代码」编号不存在，请参考预录入信息中的红色编号`;
        }
      } else if ((col === 'd2' || col === 'd3' || col === 'd4') && !/^\d+$/.test(val)) {
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
