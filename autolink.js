//returns a string with the proper hyperlinks, also allows some callbacks. By Bryan Woods(https://github.com/bryanwoods/).
//usage:"This is a link to Google http://google.com".autoLink({ target: "_blank", rel: "nofollow", id: "1" })
/*with callback:// Input "This is a link to image http://example.com/logo.png".autoLink({
  callback: function(url) {
    return /\.(gif|png|jpe?g)$/i.test(url) ? '<img src="' + url + '">' : null; }});
	Output
	"This is a link to image <img src='http://example.com/logo.png'>"*/
//@ sourceMappingURL=autolink.map
// Generated by CoffeeScript 1.6.1
(function() {
  var autoLink,
    __slice = [].slice;

  autoLink = function() {
    var callbackThunk, key, link_attributes, option, options, url_pattern, value;
    options = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    link_attributes = '';
    option = options[0];
    url_pattern = /(^|\s)(\b(https?|ftp):\/\/[\-A-Z0-9+\u0026@#\/%?=~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~_|])/gi;
    if (!(options.length > 0)) {
      return this.replace(url_pattern, "$1<a href='$2'>$2</a>");
    }
    if ((option['callback'] != null) && typeof option['callback'] === 'function') {
      callbackThunk = option['callback'];
      delete option['callback'];
    }
    for (key in option) {
      value = option[key];
      link_attributes += " " + key + "='" + value + "'";
    }
    return this.replace(url_pattern, function(match, space, url) {
      var link, returnCallback;
      returnCallback = callbackThunk && callbackThunk(url);
      link = returnCallback || ("<a href='" + url + "'" + link_attributes + ">" + url + "</a>");
      return "" + space + link;
    });
  };

  String.prototype['autoLink'] = autoLink;

}).call(this);