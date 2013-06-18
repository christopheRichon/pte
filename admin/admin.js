var EvtListView = Backbone.View.extend({
    
    tagName : "div",
    template: _.template( $('#list-template').html() ),

    events: {
        'click .delete': 'del',
    },

    del: function(){
        this.model.destroy();
        this.unbind();
        this.remove();
    },
    
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }

});

//var EvtView = Backbone.View.extend({
    
    //tagName : "div",
    //template: _.template( $('#evt-template').html() ),
    
    //render: function() {
        //this.$el.html(this.template(this.model.toJSON()));
        //return this;
    //}

//});


var AdminView = Backbone.View.extend({
    el: '#container',

    events:{
          'click #submitEvt': "newEvents",
    },

    initialize: function(){
          this.listenTo(Evts, 'add', this.addEvt);
          this.listenTo(Evts, 'reset', this.addEvts);
          $('#editor').wysihtml5();
            //select a date picker
          $.datepicker.setDefaults({ dateFormat: 'yy-mm-dd' });          
    },

    newEvents: function(){

		var $inputs = $('#addForm :input');

		//var values = {};
		//$inputs.each(function() {
			//values[this.name] = $(this).val();
        //});
        
        var id = null;
        if($('#addForm :input[name="id"]').val() !== 0)
            id = $('#addForm :input[name="id"]').val();
        
        var branch = "";
        // retrieve branch value
        $('#addForm :input[name="branch"]:checked').each(function(){ 
            branch += this.getAttribute("value") + " ";})
        
        var newEvt = new Evt({
            id: id,
            title: $('#addForm :input[name="title"]').val(),
            description:  $('#addForm :input[name="description"]').val(),
            type:  $('#addForm :input[name="type"]').val(),
            place:  $('#addForm :input[name="place"]').val(),
            begin_date: $('#addForm :input[name="begin_date"]').val(),
            end_date: $('#addForm :input[name="end_date"]').val(),
            img_path: $('#addForm :input[name="img_path"]').val(),
            pdf_path: $('#addForm :input[name="pdf_path"]').val(),
            branch: branch
        });
        
        if (newEvt.get("id") === null)
            Evts.create(newEvt);
        else{
            newEvt.save();
            Evts.add(newEvt, {merge: true});
        }
    },

    addEvt: function(evt) {
        var listView = new EvtListView({model: evt, className: evt.get("type")});
        $("#list-container").append(listView.render().el);
    },

    addEvts: function(){ Evts.each(this.addEvt()); }

})

var admin = new AdminView();

function clean() { 
    $('#list-container').hide(); 
    $('#container').hide();
    $('#listModal').hide();
}

window.DocsRouter = Backbone.Router.extend({

    routes: {
        "": function(){ clean(); $('#list-container').show(); },
        "update/:id": "update", 
    //function(id) { clean(); $('#item-container').show(); $('#updateEvt' + id).show(); $('#edit'+ id).wysihtml5()},
        "add": function() { clean(); $('#container').show(); },
        "evt/:id": "showList"
    },

    showList: function (id) {
        $(".modal-body > ul").empty();
        var myList = Students.where({evt_id: id});
        var li = null;
        if (myList.length > 0){
            for (var i = 0; i < myList.length; i++) {
                li = document.createElement('li');
                li.innerHTML = myList[i].get("student");
                $(".modal-body > ul").append(li);
            }
        }
        else {
                li = document.createElement('li');
                li.innerHTML = "Pas d'étudients inscrits pour le moment"; 
                $(".modal-body > ul").append(li);
        }
            
        $('#listModal').modal();
        router.navigate('');
    },

    update: function(id){
		clean();
        $('#container').show();
        var evt = Evts.get(id);
        var branch = evt.get("branch").split(" ");
        var $inputs = $('#addForm :input');

        //  set id  
        $('#addForm :input[name="id"]').val(evt.get("id"));
        // set type
        $('#addForm :input[value="' + evt.get("type") + '"]')[0].checked = true;
        // $('#addForm :input[name="description"]').val();
        var editorInstance = $('#addForm :input[name="description"]').data("wysihtml5").editor
        editorInstance.setValue(evt.get("description"));
        // var div = document.createElement('div');
        // div.innerHTML = evt.get('description');
        // $('#editor').append( div );
  
        // set branch and text input
        $inputs.each(function() {
            if (this.type === "text")
                this.value = evt.get(this.name);
            else if (this.type === "checkbox")
                if (branch.indexOf(this.value) >= 0 )
                    this.checked = true;
            // console.log(this);
        });

    }
})

router = new DocsRouter();
Backbone.history.start();

Evts.fetch();
Students.fetch();
$('.datepicker').datepicker();

// document.getElementById('files').addEventListener('change', handleFileSelect, false);

$(document).ready(function() {
    $('#UploadForm').on('submit', function(e) {
        e.preventDefault();
        // $('#SubmitButton').attr('disabled', ''); // disable upload button
        //show uploading message
        $("#output").html('<div style="padding:10px"><img src="images/ajax-loader.gif" alt="Please Wait"/> <span>Uploading...</span></div>');
        $(this).ajaxSubmit({
            target: '#output',
            success:  afterSuccess //call function after success
        });
    });
});

function afterSuccess(responseText, statusText, xhr, $form)  {
    // $('#UploadForm').resetForm();  // reset form
    // $('#SubmitButton').removeAttr('disabled'); //enable submit button
    var answer = JSON.parse(responseText);
    $('input[name="img_path"]').val(answer["img_path"]);
    $('input[name="pdf_path"]').val(answer["pdf_path"]);

    // alert('status: ' + statusText + '\n\nresponseText: \n' + responseText + 
    //     '\n\nThe output div should have already been updated with the responseText.'); 
}

$('input[type="file"]').change(function(){ $('#UploadForm').submit(); });


// document.getElementById('').addEventListener('change', handleFileSelect, false);
