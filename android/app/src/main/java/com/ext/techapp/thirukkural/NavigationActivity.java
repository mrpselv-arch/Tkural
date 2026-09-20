package com.ext.techapp.thirukkural;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.widget.TextView;

import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.NotificationCompat;
import androidx.core.app.TaskStackBuilder;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;

import com.google.android.material.navigation.NavigationView;

import com.ext.techapp.thirukkural.notification.DailyCoupletReceiver;
import com.ext.techapp.thirukkural.notification.NotificationDetailActivity;
import com.ext.techapp.thirukkural.preference.SettingsActivity;
import com.ext.techapp.thirukkural.search.SearchActivity;
import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.Map;
import java.util.StringTokenizer;

public class NavigationActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener, ItemListFragment.OnListFragmentInteractionListener,
        AboutFragment.OnFragmentInteractionListener, SearchView.OnQueryTextListener {

    TextView aboutThirukkural;
    NavigationView navigationView;
    private static final int NOTIFICATION_PERMISSION_CODE = 101;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_navigation);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.addDrawerListener(toggle);
        toggle.syncState();

        navigationView = findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);

        // Android 13+ / 14 notification permission check
        checkNotificationPermission();

        Bundle bundle = getIntent().getExtras();
        if (bundle != null) {
            int itemId = bundle.getInt(ItemListFragment.NAV_ITEM_ID);
            int resId = getResourceId("chapter_" + itemId, "id", getPackageName());
            Log.d("navi bundle is:", resId + ":" + itemId);

            if (itemId < navigationView.getMenu().size()) {
                this.onNavigationItemSelected(navigationView.getMenu().getItem(itemId).setChecked(true));
            }
        } else {
            AboutFragment about = new AboutFragment();
            getSupportFragmentManager().beginTransaction().replace(R.id.item_list_fragment_layout, about).commit();
        }
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
            e.printStackTrace();
            return -1;
        }
    }

    @Override
    public void onBackPressed() {
        DrawerLayout drawer = findViewById(R.id.drawer_layout);
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
            navigationView.getMenu().findItem(R.id.thiruvalluvar).setChecked(true);
            getSupportFragmentManager().beginTransaction().replace(R.id.item_list_fragment_layout, about).commit();
        } else {
            ItemListFragment listFragment = new ItemListFragment();
            Bundle bundle = new Bundle();
            bundle.putInt(ItemListFragment.NAV_ITEM_ID, id);

            StringTokenizer tokens = new StringTokenizer(item.getTitle().toString(), ".");
            String chapter_code = tokens.nextToken();
            bundle.putString(ItemListFragment.NAV_CHAPTER, chapter_code);
            bundle.putString(ItemListFragment.NAV_ITEM_TITLE, item.getTitle().toString());
            listFragment.setArguments(bundle);

            int chap_code = Integer.valueOf(chapter_code);
            if (chap_code < navigationView.getMenu().size()) {
                navigationView.getMenu().getItem(chap_code).setChecked(true);
            }
            getSupportFragmentManager().beginTransaction().replace(R.id.item_list_fragment_layout, listFragment).commit();
        }

        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        if (drawer != null) {
            drawer.closeDrawer(GravityCompat.START);
        }
        return true;
    }

    @Override
    public void onFragmentInteraction(int id, CoupletsXMLParser.Couplet couplet) {
        Intent intent = new Intent(this, ItemDetailActivity.class);
        intent.putExtra("couplet_number", id);
        intent.putExtra("selected_couplet", couplet);
        startActivity(intent);
    }

    @Override
    public void onFragmentInteraction(Uri uri) {
    }

    @Override
    public boolean onQueryTextSubmit(String query) {
        return false;
    }

    @Override
    public boolean onQueryTextChange(String newText) {
        return false;
    }
}

