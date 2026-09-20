package com.ext.techapp.thirukkural;

import android.Manifest;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.webkit.WebViewAssetLoader;

import com.google.android.material.navigation.NavigationView;

import com.ext.techapp.thirukkural.preference.SettingsActivity;
import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

import java.io.IOException;
import java.io.InputStream;
import java.util.StringTokenizer;

public class NavigationActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener,
        ItemListFragment.OnListFragmentInteractionListener,
        AboutFragment.OnFragmentInteractionListener,
        SearchView.OnQueryTextListener {

    private static final String TAG = "NavigationActivity";
    private static final int NOTIFICATION_PERMISSION_CODE = 101;

    private NavigationView navigationView;
    private DrawerLayout drawer;
    private WebView mWebView;
    private int pendingChapterId = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_navigation);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        drawer = findViewById(R.id.drawer_layout);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.addDrawerListener(toggle);
        toggle.syncState();

        navigationView = findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);

        // Android 13+ / 14 notification permission check
        checkNotificationPermission();

        // Check if intent specified a chapter
        Bundle bundle = getIntent().getExtras();
        if (bundle != null && bundle.containsKey(ItemListFragment.NAV_ITEM_ID)) {
            pendingChapterId = bundle.getInt(ItemListFragment.NAV_ITEM_ID, 1);
        }

        setupWebView();
    }

    private void setupWebView() {
        mWebView = findViewById(R.id.main_webview);
        if (mWebView == null) return;

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                WebResourceResponse response = assetLoader.shouldInterceptRequest(url);
                if (response != null) {
                    return response;
                }

                // Fallback interception for root and relative asset requests
                String path = url.getPath();
                if (path != null) {
                    String assetPath = path.startsWith("/") ? path.substring(1) : path;
                    if (assetPath.startsWith("assets/")) {
                        assetPath = assetPath.substring(7);
                    }
                    try {
                        InputStream is = getAssets().open(assetPath);
                        String mimeType = "text/plain";
                        if (assetPath.endsWith(".html")) mimeType = "text/html";
                        else if (assetPath.endsWith(".js")) mimeType = "application/javascript";
                        else if (assetPath.endsWith(".css")) mimeType = "text/css";
                        else if (assetPath.endsWith(".json")) mimeType = "application/json";
                        else if (assetPath.endsWith(".png")) mimeType = "image/png";
                        else if (assetPath.endsWith(".svg")) mimeType = "image/svg+xml";
                        else if (assetPath.endsWith(".jpg") || assetPath.endsWith(".jpeg")) mimeType = "image/jpeg";
                        return new WebResourceResponse(mimeType, "UTF-8", is);
                    } catch (IOException ignored) {
                    }
                }
                return null;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (pendingChapterId > 1) {
                    view.evaluateJavascript("if (window.openChapter) { window.openChapter(" + pendingChapterId + "); }", null);
                }
            }
        });

        // Bridge for native Android integration
        mWebView.addJavascriptInterface(new Object() {
            @android.webkit.JavascriptInterface
            public void shareCouplet(String text) {
                Intent sendIntent = new Intent();
                sendIntent.setAction(Intent.ACTION_SEND);
                sendIntent.putExtra(Intent.EXTRA_TEXT, text);
                sendIntent.setType("text/plain");
                Intent shareIntent = Intent.createChooser(sendIntent, "திருக்குறள்");
                startActivity(shareIntent);
            }
        }, "AndroidBridge");

        // Load the modern production web app
        mWebView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    private void checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATION_PERMISSION_CODE);
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (drawer != null && drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.navigation, menu);

        SearchManager searchManager = (SearchManager) getSystemService(Context.SEARCH_SERVICE);
        MenuItem searchItem = menu.findItem(R.id.search);
        if (searchItem != null) {
            SearchView searchView = (SearchView) searchItem.getActionView();
            if (searchView != null && searchManager != null) {
                searchView.setSearchableInfo(searchManager.getSearchableInfo(getComponentName()));
                searchView.setIconifiedByDefault(true);
                searchView.setOnQueryTextListener(this);
            }
        }
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_settings) {
            startActivity(new Intent(this, SettingsActivity.class));
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        int id = item.getItemId();
        setTitle(item.getTitle());

        if (id == R.id.thiruvalluvar) {
            if (mWebView != null) {
                mWebView.evaluateJavascript("if (window.openAbout) { window.openAbout(); }", null);
            }
        } else {
            String title = item.getTitle() != null ? item.getTitle().toString() : "";
            StringTokenizer tokens = new StringTokenizer(title, ".");
            if (tokens.hasMoreTokens()) {
                String chapter_code = tokens.nextToken().trim();
                try {
                    int chapNum = Integer.parseInt(chapter_code);
                    if (mWebView != null) {
                        mWebView.evaluateJavascript("if (window.openChapter) { window.openChapter(" + chapNum + "); }", null);
                    }
                } catch (NumberFormatException e) {
                    Log.e(TAG, "Error parsing chapter number from title: " + title, e);
                }
            }
        }

        if (drawer != null) {
            drawer.closeDrawer(GravityCompat.START);
        }
        return true;
    }

    @Override
    public void onFragmentInteraction(int id, CoupletsXMLParser.Couplet couplet) {
        if (mWebView != null) {
            int chap = (id - 1) / 10 + 1;
            mWebView.evaluateJavascript("if (window.openChapter) { window.openChapter(" + chap + "); }", null);
        }
    }

    @Override
    public void onFragmentInteraction(Uri uri) {
    }

    @Override
    public boolean onQueryTextSubmit(String query) {
        if (mWebView != null) {
            mWebView.evaluateJavascript("if (window.openSearch) { window.openSearch(); }", null);
        }
        return true;
    }

    @Override
    public boolean onQueryTextChange(String newText) {
        return false;
    }
}
