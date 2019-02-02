class UI{
  constructor(templateSources){
    this.templateSources = templateSources;
    this.templates = {};
  }
  initialize(cb){
      this.loadTemplates(err =>{
        if(err){
            console.log(err);
            return cb(err);
        }
        fetchCurrentUser((err, user) =>{
          if(err) console.log(err);
          cb(err, user);//going to load some other stuff here
        });
      })
  }

  loadTemplates(cb){
    async.each(this.templateSources, (tmpl, cb)=> {
      $.get(tmpl.url, data => {
        this.templates[tmpl.name] = Handlebars.compile(data);
        cb();
      });
    }, err => {
      if(err) console.log(err);
      cb(err);
    });
  }
}
