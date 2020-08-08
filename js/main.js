var element = function(id){
    return document.getElementById(id);
}
var e_class = function(id){
    return document.getElementsByClassName(id);
}

// var noSleep = new NoSleep();
// document.addEventListener('click', function enableNoSleep() {
//   document.removeEventListener('click', enableNoSleep, false);
//   noSleep.enable();
// }, false);

e_class('btn_time')[0].style.display = 'none';
e_class('img_total')[0].children[0].style.display = 'none';
e_class('img_partial')[0].children[0].style.display = 'none';

var e_start_stop = element('start_stop');
e_start_stop.setAttribute('onmouseover',"style.color = '#ffff00'");
e_start_stop.setAttribute('onmouseout',"style.color = '#ffffcc'");

var e_add = element('add_time');
e_add.setAttribute('onmouseover',"style.color = '#ffff00'");
e_add.setAttribute('onmouseout',"style.color = '#c2c2a3'");

var e_sub = element('sub_time');
e_sub.setAttribute('onmouseover',"style.color = '#ffff00'");
e_sub.setAttribute('onmouseout',"style.color = '#c2c2a3'");

var e = element('file');
e.addEventListener('change',function(){preprocess(e,1)});

next_step = false;
pre_step = false;
pre_next = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clock(){await sleep(4000); pre_next = true;}

document.body.onkeyup = function(e){
    if(e.keyCode == 32){main();}
    if(e.keyCode == 13 && pre_next){next_step=true; clock(); pre_next = false;}
    if(e.keyCode == 17 && pre_next){ pre_step=true; clock(); pre_next = false;}
}

document.body.onkeydown = function(e){
    if(e.keyCode == 39){add();}
    if(e.keyCode == 37){sub();}
}

async function preprocess(e, mode){
    drag_drop(e, mode);
    await sleep(100);
    element('file').disabled = true;
    element('drop').style.color = '#ffff4d';
    e_class('drop_zone')[0].style.border = '#ffff4d 5px dashed';
    e_class('img_total')[0].children[0].style.display = 'block';
    e_class('img_partial')[0].children[0].style.display = 'block';
    draw(mode=0);
}

function drag_drop(e, mode) {
    if (mode){
        var file = e.files[0];
    }
    else{
        e.preventDefault();
        var file = e.dataTransfer.files[0];
    }
    var reader = new FileReader();
    reader.onload = function(event) {
        step = event.target.result.split(',');
        step = step.slice(1,-1);
        // reverse(step);
    };
    reader.readAsText(file); 
    drop.innerText='Done';
}

function reverse(array){
    var start = ['001'];
    var rev = step.slice(1).reverse();
    step = start.concat(rev);
}

function draw(mode,end){
    switch (mode){
        case 0:
            var canvas = element('total');
            var Dstep = step.map(Number);
            break;
        case 1:
            var canvas = element('partial');
            var Dstep = step.slice(0,end).map(Number);
            break;
    }
    var Npin = 200;
    var Rw = canvas.width/2;
    var Rh = canvas.height/2;
    var X = Array(Dstep.length).fill(0);
    var Y = Array(Dstep.length).fill(0);
    var ctx = canvas.getContext('2d');

    ctx.lineWidth = 0.1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    for (var i=0; i<Dstep.length; i++){
        fi = Dstep[i]*2*Math.PI/Npin;
　      X[i] = Rw+Rw*0.95*Math.cos(fi);
        Y[i] = Rh+Rh*0.95*Math.sin(fi);
        if (i==0){
            ctx.moveTo(X[i],Y[i]);
        } else {
        ctx.lineTo(X[i],Y[i]);
      }
    }
    ctx.stroke();
}

function main(){
    switch (start_stop.value){
        case 'Start': enable='start'; start(); break;
        case 'Stop' : enable='stop';  stop();  break;
    }
}

function stop(){
    element('start_stop').value = 'Start';
    element('start_stop').style.color = '#ffffcc';
    element('step_input').disabled = false;
    var value = Number(element('step_input').value);
    alert('Your latest step is ' + value + 
        '. To continue, you can key in step value ' +
        (value+1) + ' before start.','OK');
}

function start(){
    if (typeof step === 'undefined'){
        alert('Please load the step file first.','OK');
        return;
    }

    N_start = Number(element('step_input').value);
    N_start = Math.round(N_start*3);

    if (3<=N_start && N_start<=step.length+2){
        draw(mode=0);
        draw(mode=1,end=N_start);
    }else{
        alert('Step must be 1 ~ '+Math.ceil(step.length/3),'OK');
        element('bar').style.width = '0%';
        return;
    }

    if (time.innerText){
        t_interval = Number(time.innerText.split(' ')[0]);
    }
    else{
        t_interval = 30;
        time.innerText = t_interval+' s';
    }

    element('start_stop').disabled = true;
    element('step_input').disabled = true;
    element('bar').style.width = '100%';
    element('start_stop').style.color = '#ffff00';
    e_class('btn_time')[0].style.display = 'block';
    e_class('drop_zone')[0].style.display = 'none';
    T_bar = 100;
    next.innerText = 'Next';
    enter.innerText = 'Enter';
    ctrl.innerText = 'Ctrl';
    var frame = document.createElement('DIV');
    frame.setAttribute('id','frame');
    element('text').appendChild(frame);

    process();
}

async function process(){
    var st = Array(12).fill(0);
    var n_step = Number(element('step_input').value);
    n_step = Math.ceil(n_step*3);

    for(var i=0; i<12; i++){
        var j = step[n_step+i-9];
        if (j) {st[i] =   j  ;}
        else   {st[i] = '   ';}
    }

    n1.innerText = st[0]+" "+st[1]+" "+st[2];
    n2.innerText = st[3]+" "+st[4]+" "+st[5];
    n3.innerText = st[6]+" "+st[7]+" "+st[8];
    n4.innerText = st[9]+" "+st[10]+" "+st[11];

    if (n_step===N_start && T_bar===100){
        var wait = 5;
        for(var i=0; i<wait; i++){
            start_stop.value = wait-i; 
            await sleep(1000);
        }
        start_stop.value = 'Stop';
        element('start_stop').disabled = false; 
        element('start_stop').style.color = '#ffffcc';
    }

    sound(n_step-3);
    progress_bar();

    next_step = false;
    pre_step = false;
    pre_next = false;
    clock();

    while (T_bar > 0 && !next_step && !pre_step){
        if (enable==='stop'){return;}
        await sleep(500);
    }
    await sleep(100);

    if (n_step>=step.length){finish(); return;}

    if (!pre_step){
        n_step = Math.min(n_step+3, step.length);
    }else{
        n_step = Math.max(n_step-3, 3);
    }
    element('step_input').value = Math.ceil(n_step/3);
    draw(mode=1, end=n_step-1);

    process();
}

function sound(n){
  path="resource/sound/English/";
//   path="resource/sound/Chinese/";
  var sound = new Howl({
    src: [path+Number(step[n])+".mp3"],
    onend: function(){
      n=n+1;
      var sound = new Howl({
        src: [path+Number(step[n])+".mp3"],
        onend: function(){
          n=n+1;
          var sound = new Howl({
            src: [path+Number(step[n])+".mp3"],
          })
      sound.play();}})
    sound.play();}})
  sound.play();
}

function finish(){
    path="resource/sound/Finish.mp3";
    var sound = new Howl({src: [path]})
    sound.play();
}

function progress_bar() {
  var e = element('bar'); 
  var id = setInterval(frame, 100);
  T_bar = 100;
  function frame() {
    if (T_bar <= 0||enable==='stop'||next_step||pre_step) {
        clearInterval(id);
    } else {
        e.style.width = T_bar + '%';
        T_bar = T_bar - 10/t_interval;
    }
  }
}

function add(){
    if (typeof t_interval === 'undefined'){return;}
    if (t_interval>=100){return;}
    var r = t_interval/(t_interval+1);
    t_interval++;
    time.innerText = t_interval+' s';
    T_bar = 100 - (100-T_bar)*r;
}

function sub(){
    if (typeof t_interval === 'undefined'){return;}
    if (t_interval<=5){return;}
    var r = t_interval/(t_interval-1);
    t_interval--;
    time.innerText = t_interval+' s';
    T_bar = 100 - (100-T_bar)*r;
}
