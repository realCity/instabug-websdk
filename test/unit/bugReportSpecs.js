/* eslint-disable no-restricted-properties */
describe('Bug Reporting Module', () => {
  const bugReport = require('../../src/bugReport');
  const elem = require('../../src/element');

  const response = {
    status: 200,
    contentType: 'text/plain',
    responseText: '{"id": 123456789}',
  };

  beforeEach(() => {
    const fakeForm = document.createElement('form');
    const fakeEmail = document.createElement('input');
    const fakeComment = document.createElement('input');
    const fakeExtraFile = document.createElement('input');

    jasmine.Ajax.install();

    spyOn(elem, 'show');
    spyOn(elem, 'hide');

    fakeEmail.type = 'email';
    fakeEmail.name = 'email';
    fakeEmail.value = 'test@instabug.com';
    fakeComment.type = 'text';
    fakeComment.name = 'comment';
    fakeComment.value = 'fake comment';
    fakeExtraFile.type = 'file';
    fakeExtraFile.name = 'image';
    fakeExtraFile.id = 'extra-image';
    fakeForm.appendChild(fakeEmail);
    fakeForm.appendChild(fakeComment);
    fakeForm.appendChild(fakeExtraFile);
    spyOn(document, 'getElementById').and.callFake((id) => {
      switch (id) {
        case 'instabugForm':
          return fakeForm;
        case 'extra-image':
          return fakeExtraFile;
      }
      return null;
    });

    jasmine.Ajax.stubRequest('/api/1').andReturn(response);
    jasmine.Ajax.stubRequest('https://api.cloudinary.com/v1_1/fakeId/upload').andReturn(response);
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  describe('Collect user browser infromation', () => {
    beforeEach(() => {
      navigator.__defineGetter__('language', () => 'foo');

      bugReport.getBrowserData();
    });

    it('should return user object', () => {
      const userInfo = bugReport.getBrowserData();
      expect(typeof userInfo).toBe('object');
    });
  });

  describe('Memory Information', () => {
    it('should set Zapier webhook url correctly', () => {
      bugReport.setZapierHookUrl('https://zapier.com');
      expect(bugReport.getZapierHookUrl()).toBe('https://zapier.com');
    });

    it('should submit report', () => {
      jasmine.Ajax.stubRequest('https://zapier.com').andReturn(response);
      bugReport.submitBugReport();

      expect(elem.hide).toHaveBeenCalled();
    });
  });
});
