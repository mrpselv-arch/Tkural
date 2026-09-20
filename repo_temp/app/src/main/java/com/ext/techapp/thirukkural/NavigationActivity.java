package com.ext.techapp.thirukkural;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.PendingIntent;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.database.MatrixCursor;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.SystemClock;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.TaskStackBuilder;
import android.support.v7.widget.SearchView;
import android.util.Log;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.TextView;
import android.widget.Toast;

import com.ext.techapp.thirukkural.notification.DailyCoupletReceiver;
import com.ext.techapp.thirukkural.notification.NotificationDetailActivity;
import com.ext.techapp.thirukkural.preference.SettingsActivity;
import com.ext.techapp.thirukkural.preference.SettingsFragment;

import com.ext.techapp.thirukkural.search.SearchActivity;
import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.Map;
import java.util.StringTokenizer;

public class NavigationActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener,ItemListFragment.OnListFragmentInteractionListener,
        AboutFragment.OnFragmentInteractionListener,SearchView.OnQueryTextListener {

    TextView aboutThirukkural;
    NavigationView navigationView;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_navigation);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);



       /* FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });*/

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.setDrawerListener(toggle);
        toggle.syncState();



         navigationView = (NavigationView) findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);

        Bundle bundle = getIntent().getExtras();
        if(bundle!=null) {
            int itemId = bundle.getInt(ItemListFragment.NAV_ITEM_ID);
            int resId = getResourceId("chapter_"+itemId,"id",getPackageName());
            Log.d("navi bundle is:",resId+":"+itemId);

            //default item or previously selected item
            this.onNavigationItemSelected(navigationView.getMenu().getItem(itemId).setChecked(true));
           // navigationView. setCheckedItem(itemId);
        }else
        {
         //   aboutThirukkural = (TextView)findViewById(R.id.about_thiruvalluvar);
            //aboutThirukkural.clearComposingText();
           // aboutThirukkural.setText(R.string.about_thirukkural);

            AboutFragment about = new AboutFragment();
            getSupportFragmentManager().beginTransaction().replace(R.id.item_list_fragment_layout,about).commit();

        }


    }


    public  int getResourceId(String pVariableName, String pResourcename, String pPackageName)
    {
        try {
            return getResources().getIdentifier(pVariableName, pResourcename, pPackageName);
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    @Override
    public void onBackPressed() {
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
       // getMenuInflater().inflate(R.menu.navigation, menu);

        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.navigation, menu);



        // Associate searchable configuration with the SearchView
        SearchManager searchManager =
                (SearchManager) getSystemService(Context.SEARCH_SERVICE);
        SearchView searchView =
                (SearchView) menu.findItem(R.id.search).getActionView();
       // searchView.setSubmitButtonEnabled(true);
      //  Log.d("got......",searchView+"");
        searchView.setSearchableInfo(
                searchManager.getSearchableInfo(getComponentName()));
        searchView.setIconifiedByDefault(true);
       // searchView.setSubmitButtonEnabled(true);
       // Intent in= new Intent(this,SearchActivity.class);
        searchView.setOnQueryTextListener(this);
       // startActivity(in);
       // searchView.setSubmitButtonEnabled(true);

        return true;
    }


    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        switch (id){
            case R.id.action_settings:
                startActivity(new Intent(this,SettingsActivity.class));
                break;
            case R.id.search:
               // onSearchRequested();
                break;
        }
       // if (id == R.id.action_settings) {
            //scheduleNotification();
            //startActivity(new Intent(this,SettingsActivity.class));
        //   return true;
       // }
        return super.onOptionsItemSelected(item);
    }

    private void scheduleNotification() {
        NotificationCompat.Builder mBuilder =
                new NotificationCompat.Builder(this)
                        .setSmallIcon(android.R.drawable.stat_notify_missed_call).setContentTitle("Today");
                       // .setContentTitle("இன்றைய குறள்");
                        //.setContentText("Hello World!");

        final Intent intent = new Intent(this, NotificationDetailActivity.class);
        CoupletsXMLParser.Couplet couplet = getCouplet();

        intent.putExtra("couplet_number", couplet.getCoupletNumber());
        intent.putExtra("selected_couplet", couplet);

        TaskStackBuilder stackBuilder = TaskStackBuilder.create(this);
        stackBuilder.addParentStack(NotificationDetailActivity.class);
        stackBuilder.addNextIntent(intent);

        PendingIntent resultPendingIntent =
                stackBuilder.getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT);

        //final PendingIntent contentIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
        mBuilder.setContentIntent(resultPendingIntent);

        mBuilder.setContentText(couplet.getFirstLineTamil() + "\n" + couplet.getSecondLineTamil());

        mBuilder.setAutoCancel(true);
        Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        //mBuilder.setSound(alarmSound);

        Notification notification = mBuilder.build();


        Intent notificationIntent = new Intent(this, DailyCoupletReceiver.class);
        notificationIntent.putExtra(DailyCoupletReceiver.NOTIFICATION_ID, 1);
        notificationIntent.putExtra(DailyCoupletReceiver.NOTIFICATION, notification);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(this, 0, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);


        // Set the alarm to start at approximately 8:00 a.m.
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(System.currentTimeMillis());
        calendar.set(Calendar.HOUR_OF_DAY, 8);

        AlarmManager alarmManager = (AlarmManager)getSystemService(Context.ALARM_SERVICE);
        //alarmManager.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, futureInMillis, pendingIntent);
       // alarmManager.setInexactRepeating(AlarmManager.RTC_WAKEUP, calendar.getTimeInMillis(),
          //     AlarmManager.INTERVAL_DAY, pendingIntent);
        alarmManager.setInexactRepeating(AlarmManager.RTC_WAKEUP, SystemClock.currentThreadTimeMillis(),
        1000*60*1, pendingIntent);


    }

    private CoupletsXMLParser.Couplet getCouplet(){
        int min = 1;
        int max = 133;


        int chapter_code = min + (int)(Math.random() * ((max - min) + 1));
//        r.nextInt(max - min + 1) + min;

        int id = getResources().getIdentifier("chapter_" + chapter_code, "raw", this.getPackageName());
        InputStream in = getResources().openRawResource(id);
        CoupletsXMLParser.Couplet couplet=null;
        try {
            Map<Integer, CoupletsXMLParser.Couplet> coupletsMap = new CoupletsXMLParser().coupletsList(in);
            CoupletsXMLParser.Couplet[] couplet_list_to_show = new CoupletsXMLParser.Couplet[10];
            int i = 0;
            for (Object key : coupletsMap.keySet()) {
                // int i = (int)key;
                CoupletsXMLParser.Couplet kural = coupletsMap.get(key);
                couplet_list_to_show[i] = kural;
                i++;
            }

            int kural = 0 + (int)(Math.random() * ((9 - 0) + 1));
            couplet=couplet_list_to_show[kural];
        } catch (XmlPullParserException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return couplet;
    }

    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        int id = item.getItemId();

        setTitle(item.getTitle());
        if(id==R.id.thiruvalluvar){
            AboutFragment about = new AboutFragment();
            Bundle bundle = new Bundle();
            bundle.putInt(AboutFragment.ABOUT_TEXT_ID, id);
            about.setArguments(bundle);
            navigationView.getMenu().findItem(R.id.thiruvalluvar).setChecked(true);
            getSupportFragmentManager().beginTransaction().replace(R.id.item_list_fragment_layout,about).commit();

        }else {
            ItemListFragment listFragment = new ItemListFragment();
            Bundle bundle = new Bundle();
            bundle.putInt(ItemListFragment.NAV_ITEM_ID, id);

            StringTokenizer tokens = new StringTokenizer(item.getTitle().toString(), ".");
            String chapter_code = tokens.nextToken();
            bundle.putString(ItemListFragment.NAV_CHAPTER, chapter_code);

            bundle.putString(ItemListFragment.NAV_ITEM_TITLE, item.getTitle().toString());
            listFragment.setArguments(bundle);

            Log.d("befor fragment", bundle + ":"+id);
            int chap_code = Integer.valueOf(chapter_code);
            navigationView.getMenu().getItem(chap_code).setChecked(true);
            getSupportFragmentManager().beginTransaction().replace(R.id.item_list_fragment_layout, listFragment).commit();
        }
            DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
            drawer.closeDrawer(GravityCompat.START);

        return true;
    }

    @Override
    public void onFragmentInteraction(int id,CoupletsXMLParser.Couplet couplet) {
        Intent intent = new Intent(this,ItemDetailActivity.class);
        intent.putExtra("couplet_number", id);
        intent.putExtra("selected_couplet",couplet);
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
    Log.d("Hello...",newText);


        return false;
    }

}
