function update() {
    Array.from(document.getElementsByClassName("draggable")).forEach
    (
        function dragElement(elmnt) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            elmnt.childNodes[1].onmousedown = dragMouseDown;

            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                var top = elmnt.offsetTop - pos2
                var left = elmnt.offsetLeft - pos1

                var right = elmnt.childNodes[3].getBoundingClientRect().right
                var bottom = elmnt.childNodes[3].getBoundingClientRect().bottom

                if (top > 150 && left > 0 && right + 3 < (window.innerWidth || document.documentElement.clientWidth) && bottom < ((window.innerHeight || document.documentElement.clientHeight) - 6)){
                    elmnt.style.top = top + "px";
                    elmnt.style.left = left + "px";
                }
                else if (right + 3 >= (window.innerWidth || document.documentElement.clientWidth)){
                    elmnt.style.left = (elmnt.offsetLeft - 1) + "px"
                }
                else if (bottom >= ((window.innerHeight || document.documentElement.clientHeight) - 6)){
                    elmnt.style.top = (elmnt.offsetTop - 1) + "px"
                }
            }
            function closeDragElement() {
                /* stop moving when mouse button is released:*/
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    );
}
update()

function postItSyncEle(elmnt, send_type) {
    // don't forget to add px later on!!
    var id = elmnt.id
    var top = elmnt.getBoundingClientRect().top // + 'px'
    var left = elmnt.getBoundingClientRect().left
    var width = elmnt.childNodes[3].getBoundingClientRect().width
    var height = elmnt.childNodes[3].getBoundingClientRect().height
    var color = elmnt.childNodes[3].style.backgroundColor
    var zIndex = elmnt.style.zIndex
    var content = elmnt.childNodes[3].value
    var cookie = document.cookie
    var author = elmnt.childNodes[1].childNodes[7].innerHTML

    json = {
        "id": id,
        "top": top,
        "left": left,
        "width": width,
        "height": height,
        "color": color,
        "zIndex": zIndex,
        "content": content,
        "cookie": cookie,
        "author": author,
        "send_type": send_type
    }
    return json
}


$(function() {
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    const session_id = JSON.parse(document.getElementById('session').textContent);
    var savesock = new ReconnectingWebSocket('ws://' + window.location.host + "/ws/IdeaPost/" + session_id + "/");
    var oldTextareaSize = {}

    savesock.onclose = function(close_error){
        console.error(close_error)
    }
    
    savesock.onmessage = function(message) {
        var data = JSON.parse(message.data);
        if (data.send_type == 'write') {
            if (data.cookie != document.cookie) {
                document.getElementById(data.id).childNodes[3].value = data.content
                $('#saveMark').html('Changes are not saved ✖')
            }
        }
        else if (data.send_type == 'move') {
            if (data.cookie != document.cookie) {
                document.getElementById(data.id).style.top = data.top + "px"
                document.getElementById(data.id).style.left = data.left + "px"
                document.getElementById(data.id).style.backgroundColor = data.color
                document.getElementById(data.id).childNodes[3].style.backgroundColor = data.color
                document.getElementById(data.id).childNodes[3].style.zIndex = data.zIndex
                $('#saveMark').html('Changes are not saved ✖')
            }
        }
        else if (data.send_type == 'resize') {
            if (data.cookie != document.cookie) {
                document.getElementById(data.id).childNodes[3].style.width = (data.width - 20) + "px"
                document.getElementById(data.id).childNodes[3].style.height = (data.height - 4) + "px"
                $('#saveMark').html('Changes are not saved ✖')
            }
        }
        else if (data.send_type == 'create') {
            if (data.cookie != document.cookie) {
                createPostIt(data.author)
            }
        }
        else if (data.send_type == 'delete') {
            if (data.cookie != document.cookie) {
                postIt = document.getElementById(data.id)
                deletePostIt(postIt)
            }
        }
        else if (data.send_type == 'save') {
             $('#saveMark').html('Saved ✔')
        }
    };

    $(document).on('mousedown','.draggable', function(event) {
        if (event.target.nodeName == 'TEXTAREA') {
            oldTextareaSize.width = event.target.style.width
            oldTextareaSize.height = event.target.style.height
        }
    });

    $(document).on('click','.draggable', function(event){
        if (event.target.nodeName == 'DIV' || event.target.nodeName == 'IMG' || event.target.nodeName == 'H3' || event.target.nodeName == 'BUTTON'){
            var parent = event.target.parentElement;
            while (!parent.classList.contains('draggable')){
                parent = parent.parentElement;
            };
            var message = postItSyncEle(parent, "move");
            savesock.send(JSON.stringify(message));
            $('#saveMark').html('Changes are not saved ✖')
            return false
        }
        else if (event.target.nodeName == 'TEXTAREA') {
            if (event.target.style.width != oldTextareaSize.width) {
                var message = postItSyncEle(event.target.parentElement, "resize");
                savesock.send(JSON.stringify(message));
                $('#saveMark').html('Changes are not saved ✖')
                return false
            }
        }
        return false;
    });
    
    function writeJQuery(){
        $('.textarea').bind('input propertychange', function(event) {
            var message = postItSyncEle(event.target.parentElement, "write");
            savesock.send(JSON.stringify(message));
            $('#saveMark').html('Changes are not saved ✖')
            return false;
        });
    };
    writeJQuery();

    $(document).on('click', '#saveButton', function(event){
        var listPostIts = {};
        var listpost = [];
        for (let postIt of $(".draggable")){
            listpost.push(postItSyncEle(postIt, 'save'))
        }
        listPostIts['content'] = listpost
        listPostIts['send_type'] = 'save'
        listPostIts['session_code'] = session_id
        listPostIts['cookie'] = document.cookie
        savesock.send(JSON.stringify(listPostIts));
        return false;
    });


    $(document).on('click', '.deleteButton', function(event){
        postItToDelete = event.target.parentElement.parentElement.parentElement.parentElement.parentElement
        var message = postItSyncEle(postItToDelete, "delete")
        message['session_code'] = session_id
        deletePostIt(postItToDelete)
        savesock.send(JSON.stringify(message))
        return false
    });


    $(document).on('click', '#createButton', function(event){
        postAuthor = JSON.parse(document.getElementById('username').textContent)
        newPostIt = createPostIt(postAuthor)
        message = postItSyncEle(newPostIt, 'create')
        message['session_code'] = session_id
        savesock.send(JSON.stringify(message))
        return false
    });

    function createPostIt(user) {
        var max = 0;
        $('.draggable').each(function() {
            max = Math.max(this.id, max);
        });
    
        var container = document.createElement("div")
        var author = document.createElement("div")
        var header = document.createElement("h3")
        var header_text = document.createTextNode(user)
        var text_area = document.createElement("textarea")
        var thumbtacks_img = document.createElement("img")
    
        var options_menu = document.createElement("div")
        var options_menu_img = document.createElement("img")
        var options_menu_list = document.createElement("ul")
    
        var options_menu_list_delete = document.createElement("li")
        var options_menu_list_change_color = document.createElement("li")
        var options_menu_list_change_ground = document.createElement("li")
    
        var delete_button = document.createElement("button")
    
        var color_change_div = document.createElement("div")
        var change_color_button = document.createElement("button")
        var color_change_list = document.createElement("ul")
        
        var lightblue_list = document.createElement("li")
        var pink_list = document.createElement("li")
        var yellow_list = document.createElement("li")
        var lightgreen_list = document.createElement("li")
        var orange_list = document.createElement("li")
        var purple_list = document.createElement("li")
        var olive_list = document.createElement("li")
        
        var lightblue = document.createElement("button")
        var pink = document.createElement("button")
        var yellow = document.createElement("button")
        var lightgreen = document.createElement("button")
        var orange = document.createElement("button")
        var purple = document.createElement("button")
        var olive = document.createElement("button")
    
        var ground_change_div = document.createElement("div")
        var change_ground_button = document.createElement("button")
        var ground_change_list = document.createElement("ul")
    
        var up_list = document.createElement("li")
        var down_list = document.createElement("li")
        
        var up = document.createElement("button")
        var down = document.createElement("button")
    
        var break_line = document.createElement("br")
        var filler_1 = document.createTextNode("")
        var filler_2 = document.createTextNode("")
        var filler_3 = document.createTextNode("")
        var filler_4 = document.createTextNode("")
        var filler_5 = document.createTextNode("")
        var filler_6 = document.createTextNode("")
        var filler_7 = document.createTextNode("")
        var filler_8 = document.createTextNode("")
        var filler_9 = document.createTextNode("")
        var filler_10 = document.createTextNode("")
        var filler_11 = document.createTextNode("")
        var filler_12 = document.createTextNode("")
        var filler_13 = document.createTextNode("")
        var filler_14 = document.createTextNode("")
        var filler_15 = document.createTextNode("")
        var filler_16 = document.createTextNode("")
        var filler_17 = document.createTextNode("")
        var filler_18 = document.createTextNode("")
    
        container.className = "draggable"
        container.id = max + 1
        container.style.zIndex = 0
        container.style.backgroundColor = "lightblue"
        container.style.top = "150px"
        author.className = "author"
        text_area.className = "textarea"
        text_area.style.backgroundColor = "lightblue"
        thumbtacks_img.className = "thumbtacks"
        thumbtacks_img.src = thumbtackUrl
        options_menu_img.src = optionsUrl
        options_menu.className = "dropdown"
        options_menu.addEventListener("click", function(e) {
                e = e || window.event;
                var target = e.target,
                    text = target.textContent || target.innerText;
                target.parentElement.classList.toggle("show")
            });
        delete_button.className = "listbutton deleteButton"
        delete_button.innerHTML = "Delete"
    
        lightblue.className = "listbutton"
        lightblue.setAttribute("onClick", "changeColor(this)")
        lightblue.innerHTML = "lightblue"
        pink.className = "listbutton"
        pink.setAttribute("onClick", "changeColor(this)")
        pink.innerHTML = "pink"
        yellow.className = "listbutton"
        yellow.setAttribute("onClick", "changeColor(this)")
        yellow.innerHTML = "yellow"
        lightgreen.className = "listbutton"
        lightgreen.setAttribute("onClick", "changeColor(this)")
        lightgreen.innerHTML = "lightgreen"
        orange.className = "listbutton"
        orange.setAttribute("onClick", "changeColor(this)")
        orange.innerHTML = "orange"
        purple.className = "listbutton"
        purple.setAttribute("onClick", "changeColor(this)")
        purple.innerHTML = "purple"
        olive.className = "listbutton"
        olive.setAttribute("onClick", "changeColor(this)")
        olive.innerHTML = "olive"
    
        lightblue_list.appendChild(lightblue)
        pink_list.appendChild(pink)
        yellow_list.appendChild(yellow)
        lightgreen_list.appendChild(lightgreen)
        orange_list.appendChild(orange)
        purple_list.appendChild(purple)
        olive_list.appendChild(olive)
        
        color_change_div.className = "dropdowncolor"
        change_color_button.className = "listbutton"
        change_color_button.innerHTML = "Color >"
        change_color_button.setAttribute("onClick", "showDropdownColor(this)")
        
        up.className = "listbutton"
        up.setAttribute("onClick", "indexUp(this)")
        up.innerHTML = "Up +"
        down.className = "listbutton"
        down.setAttribute("onClick", "indexDown(this)")
        down.innerHTML = "Down -"
    
        up_list.appendChild(up)
        down_list.appendChild(down)
    
        ground_change_div.className = "dropdownground"
        change_ground_button.className = "listbutton"
        change_ground_button.innerHTML = "Ground >"
        change_ground_button.setAttribute("onClick", "showDropdownGround(this)")
    
    
        header.appendChild(header_text)
        
        color_change_div.appendChild(filler_11)
        color_change_div.appendChild(change_color_button)
        color_change_div.appendChild(filler_12)
    
        color_change_list.appendChild(lightblue_list)
        color_change_list.appendChild(pink_list)
        color_change_list.appendChild(yellow_list)
        color_change_list.appendChild(lightgreen_list)
        color_change_list.appendChild(orange_list)
        color_change_list.appendChild(purple_list)
        color_change_list.appendChild(olive_list)
    
        color_change_div.appendChild(color_change_list)
        color_change_div.appendChild(filler_13)
    
        ground_change_div.appendChild(change_ground_button)
    
        ground_change_list.appendChild(up_list)
        ground_change_list.appendChild(down_list)
        
        ground_change_div.appendChild(ground_change_list)
    
        options_menu_list_delete.appendChild(delete_button)
        options_menu_list_change_color.appendChild(color_change_div)
        options_menu_list_change_color.appendChild(filler_10)
        options_menu_list_change_ground.appendChild(ground_change_div)
    
        options_menu.appendChild(options_menu_img)
        options_menu.appendChild(filler_4)
        options_menu_list.appendChild(filler_6)
        options_menu_list.appendChild(options_menu_list_delete)
        options_menu_list.appendChild(filler_7)
        options_menu_list.appendChild(options_menu_list_change_color)
        options_menu_list.appendChild(filler_8)
        options_menu_list.appendChild(options_menu_list_change_ground)
        options_menu_list.appendChild(filler_9)
        options_menu.appendChild(options_menu_list)
        options_menu.appendChild(filler_5)
        
        author.appendChild(filler_14)
        author.appendChild(thumbtacks_img)
        author.appendChild(filler_15)
        author.appendChild(options_menu)
        author.appendChild(filler_16)
    
        author.appendChild(break_line)
        author.appendChild(filler_17)
        author.appendChild(header)
        author.appendChild(filler_18)
    
        container.appendChild(filler_1)
        container.appendChild(author)
        container.appendChild(filler_2)
        container.appendChild(text_area)
        container.appendChild(filler_3)
    
        document.body.appendChild(container)
        update()
        writeJQuery()
        return container
    };
});

function deletePostIt(elmnt){
    elmnt.remove()
};


Array.from(document.getElementsByClassName("dropdown")).forEach(
    function showDropdown(elmnt){
        elmnt.addEventListener("click", function(e) {
            e = e || window.event;
            var target = e.target || e.srcElement,
                text = target.textContent || target.innerText;
            target.parentElement.classList.toggle("show")
        })
    }
);

function changeColor(obj){
    color = obj.innerHTML
    elmnt =  obj.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
    text_area = elmnt.childNodes[3]
    elmnt.style.backgroundColor = color
    text_area.style.backgroundColor = color
};

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {

    if (event.target.parentElement != null) {
        if (!event.target.parentElement.classList.contains('dropdown') && !event.target.parentElement.classList.contains('dropdowncolor') && !event.target.parentElement.classList.contains('dropdownground')) {
            Array.from(document.getElementsByClassName("dropdown")).forEach(
                function (elmnt){
                    elmnt.classList.remove("show")
                    elmnt.childNodes[2].childNodes[3].childNodes[0].classList.remove("showcolor")
                    elmnt.childNodes[2].childNodes[3].childNodes[0].classList.remove("show")
                    elmnt.childNodes[2].childNodes[5].childNodes[0].classList.remove("showground")
                    elmnt.childNodes[2].childNodes[5].childNodes[0].classList.remove("show")
                }
            )
        }
        else if (event.target.parentElement.classList.contains('dropdowncolor')) {
            Array.from(document.getElementsByClassName("dropdown")).forEach(
                function (elmnt){
                    elmnt.childNodes[2].childNodes[5].childNodes[0].classList.remove("showground")
                    elmnt.childNodes[2].childNodes[5].childNodes[0].classList.remove("show")
                }
            )
        }
        else if (event.target.parentElement.classList.contains('dropdownground')) {
            Array.from(document.getElementsByClassName("dropdown")).forEach(
                function (elmnt){
                    elmnt.childNodes[2].childNodes[3].childNodes[0].classList.remove("showcolor")
                    elmnt.childNodes[2].childNodes[3].childNodes[0].classList.remove("show")
                }
            )
        }
    }
    else {
        Array.from(document.getElementsByClassName("dropdown")).forEach(
                function (elmnt){
                    elmnt.classList.remove("show")
                    elmnt.childNodes[2].childNodes[3].childNodes[0].classList.remove("showcolor")
                    elmnt.childNodes[2].childNodes[3].childNodes[0].classList.remove("show")
                    elmnt.childNodes[2].childNodes[5].childNodes[0].classList.remove("showground")
                    elmnt.childNodes[2].childNodes[5].childNodes[0].classList.remove("show")
                }
            )
    }
};

function showDropdownColor(obj) {
    obj.parentElement.classList.toggle("showcolor")
};

function showDropdownGround(obj) {
    obj.parentElement.classList.toggle("showground")
};

function indexUp(obj) {
    elmnt =  obj.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
    zIndex = parseInt(elmnt.style.zIndex)
    newZIndex = zIndex + 1
    elmnt.style.zIndex = newZIndex.toString()
}

function indexDown(obj) {
    elmnt =  obj.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
    elmnt.style.zIndex -= 1
}
