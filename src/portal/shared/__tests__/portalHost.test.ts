import { describe, it, expect } from 'vitest';
import {
  activePortal,
  bcLink,
  pcLink,
  adLink,
  loginPath,
  signupPath,
  portalHome,
} from '../portalHost';

function setHost(hostname: string) {
  Object.defineProperty(window, 'location', {
    value: { hostname },
    writable: true,
    configurable: true,
  });
}

describe('portalHost', () => {
  it('serves clean root URLs on a portal\'s own subdomain', () => {
    setHost('broadcaster.didactikmedia.com');
    expect(activePortal()).toBe('broadcaster');
    expect(bcLink('dashboard')).toBe('/dashboard');
    expect(bcLink('discover/some-slug')).toBe('/discover/some-slug');
    expect(loginPath()).toBe('/login');
    expect(signupPath()).toBe('/signup');
    expect(portalHome()).toBe('/');
    // A different portal's link stays prefixed even on this subdomain.
    expect(pcLink('dashboard')).toBe('/portal/production/dashboard');
  });

  it('maps producer. → production and admin. → admin', () => {
    setHost('producer.didactikmedia.com');
    expect(activePortal()).toBe('production');
    expect(pcLink('assets')).toBe('/assets');

    setHost('admin.didactikmedia.com');
    expect(activePortal()).toBe('admin');
    expect(adLink('overview')).toBe('/overview');
  });

  it('keeps the /portal/<role> prefix on the unified host (app.)', () => {
    setHost('app.didactikmedia.com');
    expect(activePortal()).toBeNull();
    expect(bcLink('dashboard')).toBe('/portal/broadcaster/dashboard');
    expect(loginPath()).toBe('/portal/login');
    expect(signupPath()).toBe('/portal/apply');
    expect(portalHome()).toBe('/portal');
  });

  it('treats localhost/previews as the unified host — so existing tests are unaffected', () => {
    setHost('localhost');
    expect(activePortal()).toBeNull();
    expect(bcLink('discover/x')).toBe('/portal/broadcaster/discover/x');
    expect(adLink('library?status=under_review')).toBe(
      '/portal/admin/library?status=under_review',
    );
  });
});
