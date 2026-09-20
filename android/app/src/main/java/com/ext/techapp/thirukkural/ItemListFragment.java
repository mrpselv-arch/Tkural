package com.ext.techapp.thirukkural;

import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AbsListView;
import android.widget.AdapterView;
import android.widget.ListAdapter;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;

import com.ext.techapp.thirukkural.adapter.CustomStringAdapter;
import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/**
 * A fragment representing a list of Items.
 */
public class ItemListFragment extends Fragment implements AbsListView.OnItemClickListener {

    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";
    public static final String NAV_ITEM_ID = "nav_item_id";
    public static final String NAV_ITEM_TITLE = "nav_item_title";
    public static final String NAV_CHAPTER = "nav_item_chapter";

    private String mParam1;
    private String mParam2;

    private OnListFragmentInteractionListener mListener;

    private AbsListView mListView;
    private ListAdapter mAdapter;
    private CoupletsXMLParser.Couplet[] couplet_list_to_show;

    public static ItemListFragment newInstance(String param1, String param2) {
        ItemListFragment fragment = new ItemListFragment();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, param1);
        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    public ItemListFragment() {
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getArguments() != null) {
            mParam1 = getArguments().getString(ARG_PARAM1);
            mParam2 = getArguments().getString(ARG_PARAM2);
        }

        String chapter = getArguments() != null ? getArguments().getString(NAV_CHAPTER) : "1";
        if (chapter == null) chapter = "1";

        int id = getResources().getIdentifier("chapter_" + chapter, "raw", requireActivity().getPackageName());
        if (id != 0) {
            InputStream in = getResources().openRawResource(id);
            try {
                Map<Integer, CoupletsXMLParser.Couplet> coupletsMap = new CoupletsXMLParser().coupletsList(in);
                if (coupletsMap != null && !coupletsMap.isEmpty()) {
                    couplet_list_to_show = coupletsMap.values().toArray(new CoupletsXMLParser.Couplet[0]);
                }
            } catch (XmlPullParserException | IOException e) {
                e.printStackTrace();
            }
        }

        if (couplet_list_to_show == null) {
            couplet_list_to_show = new CoupletsXMLParser.Couplet[0];
        }

        mAdapter = new CustomStringAdapter(getActivity(), R.layout.simple_list_item_1, android.R.id.text1, R.id.coupletNumber, couplet_list_to_show);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_item, container, false);

        mListView = view.findViewById(android.R.id.list);
        mListView.setAdapter(mAdapter);
        mListView.setOnItemClickListener(this);

        return view;
    }

    @Override
    public void onAttach(@NonNull Context context) {
        super.onAttach(context);
        if (context instanceof OnListFragmentInteractionListener) {
            mListener = (OnListFragmentInteractionListener) context;
        } else {
            throw new RuntimeException(context.toString()
                    + " must implement OnListFragmentInteractionListener");
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        mListener = null;
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        if (null != mListener && couplet_list_to_show != null && position < couplet_list_to_show.length) {
            CoupletsXMLParser.Couplet selectedCouplet = couplet_list_to_show[position];
            int coupletNum = 0;
            try {
                coupletNum = Integer.parseInt(selectedCouplet.getCoupletNumber());
            } catch (Exception e) {
                coupletNum = position + 1;
            }
            mListener.onFragmentInteraction(coupletNum, selectedCouplet);
        }
    }

    public void setEmptyText(CharSequence emptyText) {
        View emptyView = mListView.getEmptyView();
        if (emptyView instanceof TextView) {
            ((TextView) emptyView).setText(emptyText);
        }
    }

    public interface OnListFragmentInteractionListener {
        void onFragmentInteraction(int id, CoupletsXMLParser.Couplet couplet);
    }
}

