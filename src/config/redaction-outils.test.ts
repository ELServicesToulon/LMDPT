import { afterEach, describe, expect, it } from 'vitest';
import {
  PIGISTES_DRIVE_ENV,
  REDACTION_DRIVE_ENV,
  getPigistesDriveUrl,
  getRedactionDriveUrl,
  resolveDriveFolderUrl,
} from './redaction-outils';

const FOLDER = 'https://drive.google.com/drive/folders/1TestFolderId_abc';

describe('resolveDriveFolderUrl', () => {
  it('accepts a Drive folder URL and drops query or trailing slash', () => {
    expect(resolveDriveFolderUrl(FOLDER)).toBe(FOLDER);
    expect(resolveDriveFolderUrl(`  ${FOLDER}/?usp=sharing  `)).toBe(FOLDER);
  });

  it('keeps a trailing underscore in the folder id', () => {
    const id = '1LX-example_id_';
    expect(resolveDriveFolderUrl(`https://drive.google.com/drive/folders/${id}`)).toBe(
      `https://drive.google.com/drive/folders/${id}`,
    );
  });

  it('rejects anything that is not a Drive folder', () => {
    expect(resolveDriveFolderUrl('')).toBe('');
    expect(resolveDriveFolderUrl(null)).toBe('');
    expect(resolveDriveFolderUrl('http://drive.google.com/drive/folders/1abc')).toBe('');
    expect(resolveDriveFolderUrl('https://docs.google.com/drive/folders/1abc')).toBe('');
    expect(resolveDriveFolderUrl('https://drive.google.com/file/d/1abc/view')).toBe('');
    expect(resolveDriveFolderUrl('https://evil.example/drive/folders/1abc')).toBe('');
    expect(resolveDriveFolderUrl('https://user:pass@drive.google.com/drive/folders/1abc')).toBe('');
    expect(resolveDriveFolderUrl('javascript:alert(1)')).toBe('');
  });
});

describe('redaction drive env', () => {
  afterEach(() => {
    delete process.env[REDACTION_DRIVE_ENV];
    delete process.env[PIGISTES_DRIVE_ENV];
  });

  it('stays empty when the build vars are unset', () => {
    delete process.env[REDACTION_DRIVE_ENV];
    delete process.env[PIGISTES_DRIVE_ENV];
    expect(getRedactionDriveUrl()).toBe('');
    expect(getPigistesDriveUrl()).toBe('');
  });

  it('reads each folder from its own variable', () => {
    process.env[REDACTION_DRIVE_ENV] = FOLDER;
    process.env[PIGISTES_DRIVE_ENV] = 'https://drive.google.com/drive/folders/1PigistesBox';
    expect(getRedactionDriveUrl()).toBe(FOLDER);
    expect(getPigistesDriveUrl()).toBe('https://drive.google.com/drive/folders/1PigistesBox');
  });

  it('ignores an invalid value', () => {
    process.env[REDACTION_DRIVE_ENV] = 'https://example.com/not-drive';
    expect(getRedactionDriveUrl()).toBe('');
  });
});
