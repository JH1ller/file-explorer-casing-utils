import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { camelize, kebablize, pascalize, snakelize } from '../../transforms';
// import * as myExtension from '../../extension';

suite('String transformations test suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Camel case transform', () => {
    assert.strictEqual(camelize('fileName'), 'fileName');
    assert.strictEqual(camelize('FileName'), 'fileName');
    assert.strictEqual(camelize('file_name'), 'fileName');
    assert.strictEqual(camelize('file-name'), 'fileName');
    assert.strictEqual(camelize('just-Another_file Name'), 'justAnotherFileName');
  });
  
	test('Pascal case transform', () => {
    assert.strictEqual(pascalize('fileName'), 'FileName');
    assert.strictEqual(pascalize('FileName'), 'FileName');
    assert.strictEqual(pascalize('file_name'), 'FileName');
    assert.strictEqual(pascalize('file-name'), 'FileName');
    assert.strictEqual(pascalize('just-Another_file Name'), 'JustAnotherFileName');
	});
  
	test('Kebab case transform', () => {
    assert.strictEqual(kebablize('fileName'), 'file-name');
    assert.strictEqual(kebablize('FileName'), 'file-name');
    assert.strictEqual(kebablize('file_name'), 'file-name');
    assert.strictEqual(kebablize('file-name'), 'file-name');
    assert.strictEqual(kebablize('just-Another_file Name'), 'just-another-file-name');
	});
  
	test('Snake case transform', () => {
    assert.strictEqual(snakelize('fileName'), 'file_name');
    assert.strictEqual(snakelize('FileName'), 'file_name');
    assert.strictEqual(snakelize('file_name'), 'file_name');
    assert.strictEqual(snakelize('file-name'), 'file_name');
    assert.strictEqual(snakelize('just-Another_file Name'), 'just_another_file_name');
	});
});
