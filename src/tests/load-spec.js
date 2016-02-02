describe('ngWYSIWYG', function() {
	var iframeEditor, modelContent;

	beforeEach(function() {
		browser.get('http://localhost:8000/');
		iframeEditor = element(by.tagName('iframe'));
		modelContent = element(by.binding('content'));
	});

	it('should load the editor', function() {
		expect(iframeEditor).not.toBe(null);
		expect(modelContent.getText()).not.toBe(null);
		expect(modelContent.getText()).toBe('<h1>Hello world!</h1>');
	});

	it('should accept input', function() {
		iframeEditor.click();
		iframeEditor.sendKeys(' We are ngWYSIWYG');
		expect(modelContent.getText()).toBe('<h1>Hello world! We are ngWYSIWYG</h1>');
	});

	it('should accept image insertion', function() {
		// create a new line
		iframeEditor.click();
		iframeEditor.sendKeys(protractor.Key.ENTER);

		// click on insertImage button
		var button = element(by.css('[ng-click="insertImage()"]'));
		button.click();

		// fulfill prompt
		browser.wait(protractor.ExpectedConditions.alertIsPresent(), 1000);
		var imagePrompt = browser.switchTo().alert();
		imagePrompt.sendKeys('https://www.codementor.io/assets/page_img/learn-javascript.png');
		imagePrompt.accept();

		// check if it was added
		expect(modelContent.getText()).toBe('<h1>Hello world!</h1>' +
			'<div><img src="https://www.codementor.io/assets/page_img/learn-javascript.png"><br></div>');
	});
});