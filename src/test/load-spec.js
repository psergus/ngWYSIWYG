describe('ngWYSIWYG', function() {
	it('should load the editor', function() {
		browser.get('http://localhost:8000/');
		var iframeEditor = by.tagName('iframe');
		expect(iframeEditor).not.toBe(null);
	});
});