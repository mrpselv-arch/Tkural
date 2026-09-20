package com.ext.techapp.thirukkural.search;

import android.app.ListActivity;
import android.app.SearchManager;
import android.content.Intent;
import android.content.res.Resources;
import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.NavigationView;
import android.support.design.widget.Snackbar;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.MenuInflater;
import android.view.View;
import android.widget.AbsListView;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.SearchView;
import android.widget.Toast;

import com.ext.techapp.thirukkural.ItemDetailActivity;
import com.ext.techapp.thirukkural.ItemListFragment;
import com.ext.techapp.thirukkural.NavigationActivity;
import com.ext.techapp.thirukkural.R;
import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.StringTokenizer;

public class SearchActivity extends AppCompatActivity implements AbsListView.OnItemClickListener,ItemListFragment.OnListFragmentInteractionListener {

    @Override
    public void onFragmentInteraction(int id, CoupletsXMLParser.Couplet couplet) {
        Intent intent = new Intent(this,ItemDetailActivity.class);
        intent.putExtra("couplet_number", couplet.getCoupletNumber());
        intent.putExtra("selected_couplet",couplet);
        startActivity(intent);
    }

    ListView listView;
    int queryInt;
    String[] values;

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        Log.d("startedddddd--2", "helo");
        handleIntent(getIntent());
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_search);
         //Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        // setSupportActionBar(toolbar);

        // handleIntent(getIntent());
        // Get the intent, verify the action and get the query
        Intent intent = getIntent();
        Log.d("activitase...", "");
        if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
            String query = intent.getStringExtra(SearchManager.QUERY);
            // doMySearch(query);
            Log.d("start search 1----:", query);
            queryInt = Integer.parseInt(query);
        }

        String chapter = "";
        if (queryInt != 0 && queryInt <= 133) {
            chapter = "அதிகாரம் :" + queryInt;
        }

        String couplet = "";

        if (queryInt != 0 && queryInt <= 1330) {
            couplet = "குறள்:" + queryInt;
        }


        listView = (ListView) findViewById(android.R.id.list);
        if(chapter!="" && couplet!=""){
            values = new String[]{chapter, couplet};
        }else{
            if(chapter!="") values = new String[]{chapter};
            if(couplet!="") values = new String[]{couplet};

        }

        if(values==null) {
            values = new String[]{"Cannot find either chapter or couplet"};
        }


            ArrayAdapter<String> adapter = new ArrayAdapter<String>(this,
                    android.R.layout.simple_list_item_1, values);

            // Assign adapter to List
            listView.setAdapter(adapter);

            // Set OnItemClickListener so we can be notified on item clicks
            listView.setOnItemClickListener(this);
            // Show the Up button in the action bar.
            //getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            //getActionBar().setDisplayHomeAsUpEnabled(true);


    }

    private void handleIntent(Intent intent) {
        if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
            String query =
                    intent.getStringExtra(SearchManager.QUERY);
            doSearch(query);
        }
    }

    private void doSearch(String queryStr) {
        // get a Cursor, prepare the ListAdapter
        // and set it
        Log.d("start search:", queryStr);

    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        Log.d("this is:", values[position]);
        String selected = values[position];
        if (selected.contains("அதிகாரம்")) {

            ItemListFragment listFragment = new ItemListFragment();
            Bundle bundle = new Bundle();
            bundle.putInt(ItemListFragment.NAV_ITEM_ID, queryInt);

            Intent intent = new Intent(this,NavigationActivity.class);
            intent.putExtra(ItemListFragment.NAV_ITEM_ID, queryInt);


            listView.setVisibility(View.GONE);
           // getSupportFragmentManager().beginTransaction().replace(R.id.item_list_fragment_layout, listFragment).commit();
            startActivity(intent);

       // DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        //drawer.closeDrawer(GravityCompat.START);
    }


        if (selected.contains("குறள்")){

            int couplet_index = queryInt%10;
            int chapter = queryInt/10;
            if(couplet_index!=0){
                chapter= chapter+1;
            }
if(couplet_index==0){
    couplet_index=10;
}

            Log.d("couplet_index:",couplet_index+"chapter:"+chapter);

            CoupletsXMLParser.Couplet couplet = getCouplet(chapter,couplet_index);
            Intent intent = new Intent(this,ItemDetailActivity.class);
            intent.putExtra("couplet_number", couplet.getCoupletNumber());
            intent.putExtra("selected_couplet",couplet);
            startActivity(intent);
        }
    }

    private CoupletsXMLParser.Couplet getCouplet(int chapter_code,int couplet_code){
        int min = 1;
        int max = 133;


       // int chapter_code = min + (int)(Math.random() * ((max - min) + 1));
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

           // int kural = 0 + (int)(Math.random() * ((9 - 0) + 1));
            couplet=couplet_list_to_show[couplet_code-1];
        } catch (XmlPullParserException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return couplet;
    }
}
