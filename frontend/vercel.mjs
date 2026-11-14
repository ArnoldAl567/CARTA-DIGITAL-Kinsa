const apiOrigin = process.env.VERCEL_ENV === 'preview'
  ? 'https://carta-kinsa-api-pruebas.vercel.app'
  : 'https://carta-digital-kinsa-api.vercel.app';

export const config = {
  framework: 'angular',
  outputDirectory: 'dist/kinsa-carta/browser',
  rewrites: [
    { source: '/administrar', destination: '/index.html' },
    { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
  ],
};
