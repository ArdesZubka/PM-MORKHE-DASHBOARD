# Public access for Morkhē Studio

GitHub Pages address: https://ardeszubka.github.io/PM-MOKHE-DASHBOARD/

This publishes the same browser application and dummy accounts from `main`.
The Pages workflow builds only static browser assets, with the repository path
as Vite's base. The existing Cloudflare build keeps its default root base.
Changes to application files on `main` automatically update Pages; the workflow
can also be started from GitHub Actions.

The application stores its data in localStorage, separately for each browser
and web origin. Data saved at the Cloudflare address is not automatically moved
to GitHub Pages. Choose one address before a UT session and keep using it for
that entire session. Dummy credentials and the initial baseline are unchanged.
Logout retains tasks; baseline reset is a separate existing prototype action.

Participants open the HTTPS address directly. Changing DNS or disabling
certificate validation is not part of the participant instructions. As with
any public website, access on every provider cannot be guaranteed; verify the
normal link on the devices/networks used for the session.
