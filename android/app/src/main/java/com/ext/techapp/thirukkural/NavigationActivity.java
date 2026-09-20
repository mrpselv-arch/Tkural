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

import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;

import com.google.android.material.navigation.NavigationView;

import com.ext.techapp.thirukkural.preference.SettingsActivity;
import com.ext.techapp.thirukkural.search.SearchActivity;
import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

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

        // Load chapter from intent extras or default to Chapter 1
        Bundle bundle = getIntent().getExtras();
        if (bundle != null && bundle.containsKey(ItemListFragment.NAV_ITEM_ID)) {
            int itemId = bundle.getInt(ItemListFragment.NAV_ITEM_ID, 1);
            loadChapter(itemId);
        } else {
            loadChapter(1);
        }
    }

    public void loadChapter(int chapterNum) {
        if (chapterNum < 1) chapterNum = 1;
        if (chapterNum > 133) chapterNum = 133;

        int resId = getResourceId("chapter_" + chapterNum, "id", getPackageName());

        String title = "அதிகாரம் " + chapterNum;
        if (navigationView != null && navigationView.getMenu() != null) {
            MenuItem item = (resId != 0) ? navigationView.getMenu().findItem(resId) : null;
            if (item != null) {
                title = item.getTitle().toString();
                item.setChecked(true);
            } else if (chapterNum < navigationView.getMenu().size()) {
                MenuItem itemByIndex = navigationView.getMenu().getItem(chapterNum);
                if (itemByIndex != null) {
                    title = itemByIndex.getTitle().toString();
                    itemByIndex.setChecked(true);
                }
            }
        }

        setTitle(title);

        ItemListFragment listFragment = new ItemListFragment();
        Bundle bundle = new Bundle();
        bundle.putInt(ItemListFragment.NAV_ITEM_ID, resId != 0 ? resId : chapterNum);
        bundle.putString(ItemListFragment.NAV_CHAPTER, String.valueOf(chapterNum));
        bundle.putString(ItemListFragment.NAV_ITEM_TITLE, title);
        listFragment.setArguments(bundle);

        getSupportFragmentManager().beginTransaction()
                .replace(R.id.item_list_fragment_layout, listFragment)
                .commit();
    }

    private void checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATION_PERMISSION_CODE);
            }
        }
    }

    public int getResourceId(String pVariableName, String pResourcename, String pPackageName) {
        try {
            return getResources().getIdentifier(pVariableName, pResourcename, pPackageName);
        } catch (Exception e) {
            Log.e(TAG, "Error getting resource identifier", e);
            return 0;
        }
    }

    @Override
    public void onBackPressed() {
        if (drawer != null && drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
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
            AboutFragment about = new AboutFragment();
            Bundle bundle = new Bundle();
            bundle.putInt(AboutFragment.ABOUT_TEXT_ID, id);
            about.setArguments(bundle);
            if (navigationView != null) {
                MenuItem thiruItem = navigationView.getMenu().findItem(R.id.thiruvalluvar);
                if (thiruItem != null) thiruItem.setChecked(true);
            }
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.item_list_fragment_layout, about)
                    .commit();
        } else {
            String title = item.getTitle() != null ? item.getTitle().toString() : "";
            StringTokenizer tokens = new StringTokenizer(title, ".");
            if (tokens.hasMoreTokens()) {
                String chapter_code = tokens.nextToken().trim();
                try {
                    int chapNum = Integer.parseInt(chapter_code);
                    loadChapter(chapNum);
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
        Intent intent = new Intent(this, ItemDetailActivity.class);
        intent.putExtra("couplet_number", couplet != null ? couplet.getCoupletNumber() : String.valueOf(id));
        intent.putExtra("selected_couplet", couplet);
        startActivity(intent);
    }

    @Override
    public void onFragmentInteraction(Uri uri) {
    }

    @Override
    public boolean onQueryTextSubmit(String query) {
        Intent intent = new Intent(this, SearchActivity.class);
        intent.setAction(Intent.ACTION_SEARCH);
        intent.putExtra(SearchManager.QUERY, query);
        startActivity(intent);
        return true;
    }

    @Override
    public boolean onQueryTextChange(String newText) {
        return false;
    }
}
