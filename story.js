(function(root){
  const scenes={
    intro:{name:'序幕 · 森林里的新生命',duration:Infinity,place:'nest',step:0},
    hatch:{name:'第一幕 · 蛋壳里的小声音',duration:9,place:'nest',step:0,lines:[[0,'旁白','清晨，森林里的一颗恐龙蛋，轻轻摇晃起来。'],[4.5,'小恐龙','嗯——再用一点力气！怎么还是出不来呀？']],next:'choice1'},
    choice1:{name:'第一次选择 · 帮小恐龙破壳',duration:Infinity,place:'nest',step:1,choice:1,question:'小恐龙卡在蛋壳里了，怎么帮它？',hint:'选一个办法，让故事继续。',options:[{id:'stick',icon:'🪵',title:'用棒子敲碎蛋壳',detail:'敲开挡住它的蛋壳',next:'stick'},{id:'hand',icon:'🤲',title:'用手拿起破裂边缘的蛋壳',detail:'沿着裂口，轻轻拿开',next:'hand'}]},
    stick:{name:'第一幕 · 咚！蛋壳打开了',duration:8,place:'nest',step:1,lines:[[0,'旁白','咚、咚！棒子敲开了蛋壳，小恐龙终于出来了。'],[3.8,'小恐龙','哎呀……头晕晕的，星星都在转圈圈！']],next:'missing'},
    hand:{name:'第一幕 · 轻轻打开的世界',duration:8,place:'nest',step:1,lines:[[0,'旁白','你沿着破裂的边缘，轻轻拿起一片蛋壳。'],[3.8,'小恐龙','出来啦！哈哈，谢谢你帮我！']],next:'missing'},
    missing:{name:'第二幕 · 妈妈去哪儿了？',duration:8,place:'nest',step:2,lines:[[0,'旁白','小恐龙四处看了看，身边却没有妈妈。'],[3.8,'小恐龙','妈妈？妈妈！呜呜……你在哪里呀？']],next:'choice2'},
    choice2:{name:'第二次选择 · 妈妈在哪里',duration:Infinity,place:'nest',step:2,choice:2,question:'小恐龙哭了，接下来该怎么办？',hint:'妈妈留下的脚印，通向森林深处。',options:[{id:'wait',icon:'🌿',title:'原地等妈妈',detail:'留在蛋壳旁边等一等',next:'wait'},{id:'search',icon:'🐾',title:'顺着妈妈的脚印找妈妈',detail:'沿着脚印，走进森林',next:'search'}]},
    wait:{name:'等待路线 · 从白天到傍晚',duration:12,place:'nest',step:2,lines:[[0,'旁白','小恐龙留在蛋壳旁，安静地等妈妈。'],[4,'旁白','太阳一点点落下，白天渐渐变成了傍晚。'],[8,'小恐龙','天快黑了，妈妈怎么还没有回来呀……']],next:'waitMore'},
    waitMore:{name:'等待路线 · 再多等一会儿',duration:8,place:'nest',step:2,lines:[[0,'旁白','小恐龙焦急地望着小路，决定再多等一会儿。'],[4.5,'妈妈','宝贝！妈妈回来啦！']],next:'reunionWait'},
    search:{name:'寻找路线 · 小小的脚步',duration:9,place:'path',step:2,lines:[[0,'旁白','小恐龙擦了擦眼泪，顺着妈妈的脚印出发了。'],[4.5,'小恐龙','一个脚印，两个脚印……妈妈一定在前面！']],next:'lake'},
    lake:{name:'寻找路线 · 湖边的新朋友',duration:8,place:'lake',step:2,lines:[[0,'旁白','脚印通向一片湖。这里没有妈妈，只有一只海龟。'],[4,'小恐龙','海龟先生，你见过我的妈妈吗？']],next:'turtle'},
    turtle:{name:'寻找路线 · 海龟的消息',duration:12,place:'lake',step:2,lines:[[0,'海龟','别着急，小家伙。我刚刚看见你的妈妈啦。'],[4,'海龟','她已经回去了，只是走了另一条路。'],[8,'海龟','现在回到蛋壳那里，就能看见妈妈啦！']],next:'goBack'},
    goBack:{name:'寻找路线 · 回家的方向',duration:Infinity,place:'lake',step:2,question:'妈妈已经回去了！',hint:'谢谢善良的海龟，我们回蛋壳那里吧。',options:[{id:'return',icon:'↩',title:'回去找妈妈',detail:'沿来时的路，回到蛋壳旁',next:'return'}]},
    return:{name:'寻找路线 · 跑回妈妈身边',duration:8,place:'path',step:2,lines:[[0,'小恐龙','谢谢你，海龟先生！我要回去找妈妈啦！'],[4,'旁白','小恐龙沿着来时的路，快步跑回了蛋壳旁。']],next:'momLooking'},
    momLooking:{name:'寻找路线 · 妈妈也在找你',duration:9,place:'nest',step:3,lines:[[0,'旁白','妈妈正围着空空的蛋壳，着急地寻找小恐龙。'],[3.5,'妈妈','宝贝，你在哪里？妈妈好担心你！'],[6.5,'小恐龙','妈妈！我回来啦！']],next:'reunionSearch'},
    reunionWait:{name:'终幕 · 等到了妈妈',duration:10,place:'nest',step:3,lines:[[0,'旁白','妈妈看见蛋壳旁的小恐龙，赶紧走了过来。'],[4,'小恐龙','妈妈！我一直在这里等你！'],[7,'妈妈','妈妈找到你啦，来，抱抱。']],next:'end'},
    reunionSearch:{name:'终幕 · 终于找到你',duration:10,place:'nest',step:3,lines:[[0,'旁白','妈妈一转身，终于看见了自己的小宝贝！'],[4,'小恐龙','妈妈！我好想你！'],[7,'妈妈','宝贝，妈妈也一直在找你。']],next:'end'},
    end:{name:'故事结束 · 一个温暖的拥抱',duration:Infinity,place:'nest',step:3}
  };
  root.DinoStory=scenes;
  if(typeof module!=='undefined')module.exports=scenes;
})(typeof window!=='undefined'?window:globalThis);
